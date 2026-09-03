"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Share the card as a 1080×1920 story image.
 *
 * The image is a server-rendered URL (`/share/<id>/story`), so the two paths
 * here are: hand the file to the OS share sheet if this browser supports it —
 * which on Android and iOS puts Instagram and WhatsApp Status one tap away —
 * or open the image in a new tab so it can be long-pressed and saved.
 *
 * Never a plain `<a download>`. Page-initiated downloads are blocked outright
 * inside the in-app WebViews people open WhatsApp links in, and a button that
 * silently does nothing is worse than one that opens a picture.
 */
export default function StoryShareButton({ cardId }: { cardId: string }) {
  const [busy, setBusy] = useState(false);
  const url = `/share/${encodeURIComponent(cardId)}/story`;

  const share = async () => {
    if (busy) return;
    setBusy(true);
    track("share_channel_click", { card: cardId, channel: "story" });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("story unavailable");
      const blob = await response.blob();
      const file = new File([blob], `letterlove-${cardId}.png`, {
        type: "image/png",
      });

      // `canShare` must be checked with the actual files: several browsers
      // expose `navigator.share` but refuse file payloads, and calling share()
      // anyway throws after the user has already tapped.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }

      window.open(url, "_blank", "noopener");
    } catch {
      // Includes the user dismissing the share sheet, which rejects. Falling
      // back to the image is harmless in that case.
      window.open(url, "_blank", "noopener");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      disabled={busy}
      className="rounded-full border border-foreground/10 bg-white/60 px-5 py-2 text-xs font-medium text-foreground/60 shadow-sm transition-colors hover:bg-white/90 disabled:opacity-60"
    >
      {busy ? "Preparing…" : "Share as a story 📱"}
    </button>
  );
}
