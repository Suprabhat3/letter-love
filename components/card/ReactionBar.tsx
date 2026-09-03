"use client";

import { useCallback, useState } from "react";
import { motion } from "motion/react";
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
  const [pending, setPending] = useState<string | null>(null);

  const toggle = useCallback(
    async (emoji: ReactionEmoji) => {
      if (pending) return;
      setPending(emoji);

      const wasActive = active.has(emoji);
      const optimistic = Math.max(0, (counts[emoji] ?? 0) + (wasActive ? -1 : 1));
      setCounts((prev) => ({ ...prev, [emoji]: optimistic }));
      setActive((prev) => {
        const next = new Set(prev);
        if (wasActive) next.delete(emoji);
        else next.add(emoji);
        return next;
      });

      if (!wasActive) track("reaction_added", { card: cardId, emoji });

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
        setCounts((prev) => ({ ...prev, [emoji]: counts[emoji] ?? 0 }));
        setActive((prev) => {
          const next = new Set(prev);
          if (wasActive) next.add(emoji);
          else next.delete(emoji);
          return next;
        });
      }

      setPending(null);
    },
    [active, cardId, counts, pending],
  );

  const total = totalReactions(counts);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="text-xs text-foreground/50">
        {total > 0
          ? `${total} ${total === 1 ? "reaction" : "reactions"}`
          : "Tap to react"}
      </p>

      <div
        role="group"
        aria-label="React to this letter"
        className="flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/60 bg-white/60 px-2 py-1.5 shadow-sm"
      >
        {REACTIONS.map(({ emoji, label }) => {
          const on = active.has(emoji);
          const count = counts[emoji] ?? 0;
          return (
            <motion.button
              key={emoji}
              type="button"
              onClick={() => toggle(emoji)}
              aria-label={label}
              aria-pressed={on}
              whileTap={{ scale: 0.85 }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-base transition-colors ${
                on
                  ? "bg-pink-100 ring-1 ring-pink-300"
                  : "hover:bg-black/5 focus-visible:bg-black/5"
              }`}
            >
              <span aria-hidden>{emoji}</span>
              {count > 0 && (
                <span className="text-xs font-medium tabular-nums text-foreground/60">
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
