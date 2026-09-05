"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Template } from "@/lib/types";
import CardPreview, { demoContent } from "@/components/card/CardPreview";

/** easeOutExpo (easings.net), as the tuple Motion takes. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export interface TemplatePreviewModalProps {
  template: Template | null;
  onClose: () => void;
}

/**
 * The gallery's quick view, as an actual dialog.
 *
 * It was previously inlined in the gallery page as a bare `motion.div`, and
 * behaved like one: no exit animation on anything but the backdrop (so closing
 * it made the card vanish and the dim linger), no Escape key, no scroll lock —
 * so the gallery scrolled underneath the preview — and no focus handling, which
 * left a keyboard user tabbing through the grid behind the overlay.
 */
export default function TemplatePreviewModal({
  template,
  onClose,
}: TemplatePreviewModalProps) {
  const open = template !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Where focus came from, so it can be handed back on close. */
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Scroll lock. Restoring the previous value rather than clearing it, so
    // this composes with anything else that locks the body.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {template && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Exit stays quicker than enter: opening is the deliberate act worth
          // dwelling on, closing is the system getting out of the way.
          transition={{ duration: 0.45, ease: EASE_OUT }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md"
        >
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Preview of the ${template.name} template`}
            // A modal is the one popover that stays centred — it is not
            // anchored to a trigger, so there is no origin to grow from.
            initial={{ opacity: 0, transform: "scale(0.94) translateY(16px)" }}
            animate={{ opacity: 1, transform: "scale(1) translateY(0px)" }}
            exit={{
              opacity: 0,
              transform: "scale(0.97) translateY(8px)",
              // Per-variant, because a `transition` prop applies to every state
              // — and the exit needs to be quicker than the entrance.
              transition: { duration: 0.3, ease: EASE_OUT },
            }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            onClick={(event) => event.stopPropagation()}
            className="h-full w-full overflow-y-auto overscroll-contain"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="fixed top-5 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/15 text-foreground shadow-lg transition-[background-color,transform] duration-300 ease-out-soft hover:bg-white/30 hover:rotate-90 focus-visible:ring-2 focus-visible:ring-pink-400 active:scale-[0.94] active:duration-150"
            >
              <X size={22} />
            </button>

            {/* Every template previews through the real renderer, so this is
                what the recipient actually gets — and a new template needs no
                demo markup of its own. Interactive, so the yes/no game and the
                candles are playable here. */}
            {/* Bottom padding so the last of the card can be scrolled clear of
                the floating action bar below. */}
            <div className="pb-32">
              <CardPreview
                key={template.id}
                templateId={template.id}
                content={demoContent(template)}
                variant="page"
                interactive
                seed={template.id}
              />
            </div>

            {/*
              The CTA floats over the preview rather than sitting under it.

              Stacked below, it landed on the modal's own near-white backdrop
              while the preview above it painted the theme's gradient — so the
              two met at a hard horizontal seam right behind the button. A
              scrim that fades from the page colour up into nothing has no edge
              to notice, and it also means the button is reachable without
              scrolling to the end of a long letter.
            */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center bg-linear-to-t from-background via-background/85 to-transparent pt-20 pb-8">
              <Link
                href={`/templates/${template.id}`}
                className="btn-primary pointer-events-auto inline-block rounded-full px-8 py-4 text-lg font-semibold"
              >
                Customize this template
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
