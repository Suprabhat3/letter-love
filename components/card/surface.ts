// Turns a theme's SurfaceSpec/FrameSpec into a className + inline style.
// Kept out of the components so both CardRenderer and CardPreview get the
// identical surface without duplicating the mapping.

import type { CSSProperties } from "react";
import type { FrameSpec, SurfaceSpec, ThemePalette } from "@/lib/theme";
import { alpha, resolveColor } from "@/lib/theme";

const SHADOWS: Record<NonNullable<FrameSpec["shadow"]>, string> = {
  none: "",
  md: "shadow-md",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
};

const PAPER_TEXTURES: Record<string, string> = {
  linen: "ll-paper-linen",
  grain: "ll-paper-grain",
  kraft: "ll-paper-kraft",
};

export interface SurfaceStyles {
  className: string;
  style: CSSProperties;
  /** True when the surface is glass, so the caller can add the shine overlay. */
  shine: boolean;
}

export function surfaceStyles(
  surface: SurfaceSpec,
  frame: FrameSpec,
  palette: ThemePalette,
): SurfaceStyles {
  const classes: string[] = [];
  const style: CSSProperties = {};
  let shine = false;

  switch (surface.kind) {
    case "glass": {
      classes.push("glass-panel");
      shine = surface.shine !== false;
      const tint = resolveColor(surface.tint, palette, "secondary");
      style.background = `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${alpha(tint, 0.25)} 100%)`;
      break;
    }
    case "solid":
      style.backgroundColor = resolveColor(surface.color, palette, "paper");
      break;
    case "gradient": {
      const from = resolveColor(surface.from, palette, "paper");
      const to = resolveColor(surface.to, palette, "secondary");
      style.backgroundImage = `linear-gradient(${surface.angleDeg ?? 135}deg, ${from} 0%, ${to} 100%)`;
      break;
    }
    case "paper": {
      classes.push(PAPER_TEXTURES[surface.texture] ?? PAPER_TEXTURES.grain);
      style.backgroundColor = resolveColor(surface.tint, palette, "paper");
      break;
    }
  }

  switch (frame.kind) {
    case "deckle":
      classes.push("ll-frame-deckle");
      break;
    case "polaroid":
      classes.push("ll-frame-polaroid");
      break;
    case "stamped":
      classes.push("ll-frame-stamped");
      style.borderColor = resolveColor(frame.borderColor, palette, "secondary");
      break;
    case "none":
    case "rounded":
      break;
  }

  if (frame.radiusPx !== undefined) style.borderRadius = frame.radiusPx;
  const shadow = SHADOWS[frame.shadow ?? "xl"];
  if (shadow) classes.push(shadow);

  return { className: classes.join(" "), style, shine };
}
