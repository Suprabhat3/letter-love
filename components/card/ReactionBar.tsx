"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { track } from "@/lib/analytics";
import { sendReaction } from "@/lib/engagement-client";
import {
  REACTIONS,
  totalReactions,
  type ReactionCounts,
  type ReactionEmoji,
} from "@/lib/reactions";

export interface ReactionBarProps {
  cardId: string;
  /** Server-rendered starting counts, so the bar never counts up from zero. */
  initialCounts: ReactionCounts;
  /** Which reactions this viewer already has on, learned from the view beacon. */
  mine: readonly ReactionEmoji[];
}

/** One throwaway emoji drifting off a tapped button. */
interface Fly {
  id: number;
  emoji: string;
  /** Horizontal drift, so a double-tap does not produce two identical paths. */
  dx: number;
}

/**
 * Six taps, no account.
 *
 * The point of this is not the data — it is that a recipient who is moved by a
 * letter currently has nowhere to put that. A reaction is the smallest possible
 * gesture back, and it is also the thing that puts a notification-shaped number
 * on the sender's dashboard, which is what brings the sender back.
 *
 * Updates optimistically and reconciles against the server's reply. A reaction
 * that visibly lags a tap reads as broken on a slow connection, and this
 * audience is on one.
 */
export default function ReactionBar({
  cardId,
  initialCounts,
  mine,
}: ReactionBarProps) {
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [active, setActive] = useState<ReadonlySet<string>>(
    () => new Set(mine),
  );
  /**
   * In-flight requests, per emoji.
   *
   * This used to be a single `pending` string that blocked the *whole* bar
   * while any one request was open — so on the slow connections this audience
   * is actually on, the second tap of an enthusiastic double-reaction was
   * silently dropped. Locking only the emoji being toggled keeps the rest of
   * the bar live, and still stops one emoji's requests from racing each other.
   */
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set());

  const [flies, setFlies] = useState<readonly Fly[]>([]);
  const flyId = useRef(0);

  const addFly = useCallback((emoji: string) => {
    const id = ++flyId.current;
    // Deterministic-enough spread without a random import; the id is the seed.
    const dx = ((id * 37) % 41) - 20;
    setFlies((prev) => [...prev, { id, emoji, dx }]);
    // Matches the .ll-react-fly duration. The node removes itself rather than
    // accumulating: an emotional card can collect a lot of taps.
    setTimeout(
      () => setFlies((prev) => prev.filter((f) => f.id !== id)),
      900,
    );
  }, []);

  const toggle = useCallback(
    async (emoji: ReactionEmoji) => {
      if (pending.has(emoji)) return;
      setPending((prev) => new Set(prev).add(emoji));

      const wasActive = active.has(emoji);
      const previous = counts[emoji] ?? 0;
      const optimistic = Math.max(0, previous + (wasActive ? -1 : 1));
      setCounts((prev) => ({ ...prev, [emoji]: optimistic }));
      setActive((prev) => {
        const next = new Set(prev);
        if (wasActive) next.delete(emoji);
        else next.add(emoji);
        return next;
      });

      if (!wasActive) {
        addFly(emoji);
        track("reaction_added", { card: cardId, emoji });
      }

      const result = await sendReaction(cardId, emoji);
      if (result) {
        // The server is the truth: another viewer may have reacted between the
        // render and this tap.
        setCounts(result.counts);
        setActive((prev) => {
          const next = new Set(prev);
          if (result.active) next.add(emoji);
          else next.delete(emoji);
          return next;
        });
      } else {
        // Roll the optimistic change back rather than leaving a number the
        // next visitor will not see.
        setCounts((prev) => ({ ...prev, [emoji]: previous }));
        setActive((prev) => {
          const next = new Set(prev);
          if (wasActive) next.add(emoji);
          else next.delete(emoji);
          return next;
        });
      }

      setPending((prev) => {
        const next = new Set(prev);
        next.delete(emoji);
        return next;
      });
    },
    [active, addFly, cardId, counts, pending],
  );

  const total = totalReactions(counts);

  return (
    <div className="flex w-full flex-col items-center gap-2.5">
      <p className="text-xs tracking-wide text-foreground/45 transition-colors duration-200">
        {total > 0
          ? `${total} ${total === 1 ? "reaction" : "reactions"}`
          : "Tap to react"}
      </p>

      <div
        role="group"
        aria-label="React to this letter"
        className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/60 bg-white/70 p-1.5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.12)] backdrop-blur-sm"
      >
        {REACTIONS.map(({ emoji, label }) => {
          const on = active.has(emoji);
          const count = counts[emoji] ?? 0;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => toggle(emoji)}
              aria-label={label}
              aria-pressed={on}
              // A CSS transition, not `whileTap` — this is the most rapidly
              // re-triggered control on the page, and a transition retargets
              // from wherever the last tap left it instead of restarting.
              className={`relative flex items-center gap-1 rounded-full px-2.5 py-1.5 text-base transition-[background-color,box-shadow,transform] duration-200 ease-out-strong active:scale-[0.92] active:duration-100 ${
                on
                  ? "scale-105 bg-pink-100 shadow-[inset_0_0_0_1px_var(--color-pink-300)]"
                  : "scale-100 hover:bg-black/5 focus-visible:bg-black/5"
              }`}
            >
              <span aria-hidden>{emoji}</span>
              {count > 0 && (
                <span className="text-xs font-medium tabular-nums text-foreground/60">
                  {count}
                </span>
              )}

              {/* The tap's own confirmation, leaving from the button that was
                  tapped. Each is keyed on its tap, so nothing is ever
                  retargeted mid-flight — it plays once and unmounts. */}
              {flies
                .filter((fly) => fly.emoji === emoji)
                .map((fly) => (
                  <span
                    key={fly.id}
                    aria-hidden
                    className="ll-react-fly text-lg"
                    style={{ "--ll-dx": `${fly.dx}px` } as CSSProperties}
                  >
                    {fly.emoji}
                  </span>
                ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
