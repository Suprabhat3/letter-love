"use client";

import Link from "next/link";
import { markSignupSource, track } from "@/lib/analytics";
import { suggestReplyTemplate } from "@/lib/reply";

export interface ReplyCtaProps {
  cardId: string;
  templateId: string;
  /** Who wrote the letter being answered — the reply's recipient. */
  senderName?: string;
  /** Gold-on-dark styling, for cards that sit on a night backdrop. */
  night?: boolean;
}

/**
 * The growth engine, such as it is.
 *
 * Everything else in this phase measures the loop; this is the loop. A
 * recipient who has just finished reading something written for them is the
 * warmest non-user this product will ever have, and until now the page gave
 * them nothing to do with that. One button turns them into the next sender.
 *
 * The prefill happens on the other side, from `?replyTo=` — the names are
 * fetched there rather than passed through the URL so a link cannot be crafted
 * to put arbitrary text into someone's editor.
 */
export default function ReplyCta({
  cardId,
  templateId,
  senderName,
  night = false,
}: ReplyCtaProps) {
  const target = suggestReplyTemplate(templateId);
  const to = senderName?.trim();

  return (
    // No entrance animation of its own: CardView staggers this in with its
    // siblings, and a second delayed fade on top of that was making the button
    // arrive a beat after the row it belongs to.
    <div className="flex flex-col items-center gap-2">
      <Link
        href={`/templates/${target}?replyTo=${encodeURIComponent(cardId)}`}
        onClick={() => {
          track("reply_click", { card: cardId, template: target });
          // The recipient of a letter is a warm, emotionally primed non-user.
          // If they end up with an account, this is why.
          markSignupSource("reply");
        }}
        // `.btn-primary` already carries the hover lift, the press scale and
        // the hover gating; adding `hover:scale-[1.03]` here fought it.
        className={
          night
            ? "inline-block rounded-full bg-linear-to-r from-amber-300 via-amber-400 to-orange-400 px-7 py-3.5 text-base font-semibold text-amber-950 shadow-[0_0_40px_-8px_rgba(251,191,36,0.75)] transition-[transform,box-shadow] duration-200 ease-out-strong active:scale-[0.97] pointer-fine:hover:scale-[1.03] pointer-fine:hover:shadow-[0_0_56px_-6px_rgba(251,191,36,0.9)]"
            : "btn-primary inline-block rounded-full px-7 py-3.5 text-base font-semibold shadow-lg"
        }
      >
        {to
          ? `Write back to ${to} ${night ? "🪔" : "💌"}`
          : `Reply with a letter ${night ? "🪔" : "💌"}`}
      </Link>
      <p className={`text-xs ${night ? "text-amber-100/45" : "text-foreground/45"}`}>
        Takes two minutes. No account needed.
      </p>
    </div>
  );
}
