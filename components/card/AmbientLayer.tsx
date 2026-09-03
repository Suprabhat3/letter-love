"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import type { AmbientSpec, BlobAnchor, ThemePalette } from "@/lib/theme";
import { resolveColor } from "@/lib/theme";

const ANCHORS: Record<BlobAnchor, CSSProperties> = {
  "top-left": { top: "-20%", left: "-20%" },
  "top-right": { top: "-20%", right: "-20%" },
  "bottom-left": { bottom: "-20%", left: "-20%" },
  "bottom-right": { bottom: "-20%", right: "-20%" },
  // Centred by auto margins rather than a translate, because the blob's
  // keyframes own `transform` and would drop a centring transform mid-loop.
  center: { top: 0, left: 0, right: 0, bottom: 0, margin: "auto" },
};

/**
 * The blurred colour wash behind a card. Two nodes, animated by CSS rather
 * than by motion — they are a pure loop with no state, so there is nothing
 * for React to be involved in per frame.
 */
export default function AmbientLayer({
  ambient,
  palette,
}: {
  ambient: AmbientSpec;
  palette: ThemePalette;
}) {
  const reduceMotion = useReducedMotion();
  if (!ambient.enabled || ambient.blobs.length === 0) return null;

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {ambient.blobs.map((blob, i) => {
        // Opacity is driven by the keyframes (via --ll-opacity), so the colour
        // itself stays solid — applying alpha here as well would compound it.
        const color = resolveColor(blob.color, palette, "glow");
        return (
          <div
            key={i}
            className={reduceMotion ? "absolute rounded-full blur-3xl" : "ll-blob"}
            style={
              {
                ...ANCHORS[blob.anchor],
                width: blob.sizePx,
                height: blob.sizePx,
                backgroundColor: color,
                opacity: reduceMotion ? blob.opacity : undefined,
                "--ll-opacity": blob.opacity,
                "--ll-duration": `${blob.durationSec}s`,
                "--ll-delay": `${blob.delaySec ?? 0}s`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
