"use client";

import Link from "next/link";
import { markSignupSource, track } from "@/lib/analytics";
import { suggestReplyTemplate } from "@/lib/reply";

export interface ReplyCtaProps {
  cardId: string;
  templateId: string;
  /** Who wrote the letter being answered — the reply's recipient. */
  senderName?: string;
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
        className="btn-primary inline-block rounded-full px-7 py-3.5 text-base font-semibold shadow-lg"
      >
        {to ? `Write back to ${to} 💌` : "Reply with a letter 💌"}
      </Link>
      <p className="text-xs text-foreground/45">
        Takes two minutes. No account needed.
      </p>
    </div>
  );
}
