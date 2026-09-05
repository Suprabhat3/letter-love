"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { DecorSpec, Phase, ThemePalette } from "@/lib/theme";
import { resolveColor } from "@/lib/theme";
import { seededSeries } from "@/lib/rand";

/**
 * Hard ceiling on animated nodes per layer, regardless of what a theme asks
 * for. The old cards ran 50+ infinitely-animating nodes per card, which keeps
 * a mid-range Android compositing continuously and drains battery on the one
 * device this product is mostly viewed on.
 */
const MAX_NODES = 24;

/** Below this width the density scales down linearly. */
const FULL_DENSITY_WIDTH = 768;

function useDensity(): number {
  // Starts at 1 so the server and the first client render agree; narrow
  // viewports trim on the next frame rather than mismatching hydration.
  const [density, setDensity] = useState(1);
  useEffect(() => {
    const measure = () =>
      setDensity(Math.min(1, window.innerWidth / FULL_DENSITY_WIDTH));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return density;
}

function activeInPhase(specPhase: Phase, phase: Phase): boolean {
  return specPhase === "always" || specPhase === phase;
}

interface DecorLayerProps {
  decor: DecorSpec[];
  palette: ThemePalette;
  /** Seeds the layout so a card looks identical on every visit. */
  seed: string;
  /** Which side of the interaction the card is currently on. */
  phase: Phase;
}

export default function DecorLayer({
  decor,
  palette,
  seed,
  phase,
}: DecorLayerProps) {
  const reduceMotion = useReducedMotion();
  const density = useDensity();

  const layers = useMemo(
    () =>
      decor.map((spec, index) => {
        const count = Math.max(
          0,
          Math.min(MAX_NODES, Math.round(spec.count * density)),
        );
        return {
          spec,
          index,
          count,
          series: seededSeries(`${seed}:decor:${index}`, count, 5),
        };
      }),
    [decor, density, seed],
  );

  // Reduced motion removes decor entirely: paced, drifting particles ARE
  // motion, and dimming them is not the same as respecting the setting.
  if (reduceMotion) return null;

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {layers.map(({ spec, index, count, series }) => {
        if (count === 0 || !activeInPhase(spec.phase, phase)) return null;

        if (spec.kind === "float") {
          const [minSec, maxSec] = spec.speedSec;
          return series.map(([x, speed, delay, tint], i) => (
            <div
              key={`f${index}-${i}`}
              className={`ll-float ${
                spec.direction === "up" ? "ll-float-up" : "ll-float-down"
              }`}
              style={
                {
                  "--ll-x": `${x * 100}%`,
                  "--ll-duration": `${minSec + speed * (maxSec - minSec)}s`,
                  "--ll-delay": `${delay * (minSec + maxSec)}s`,
                  "--ll-opacity": spec.opacity ?? 0.5,
                  fontSize: `${spec.sizeRem ?? 1.5}rem`,
                  color: spec.tints
                    ? spec.tints[Math.floor(tint * spec.tints.length)]
                    : undefined,
                } as CSSProperties
              }
            >
              {spec.glyphs[i % spec.glyphs.length]}
              {spec.variant === "balloon" && (
                <span className="ll-balloon-string" />
              )}
            </div>
          ));
        }

        return series.map(([x, y, speed, rot, delay], i) => (
          <div
            key={`b${index}-${i}`}
            className={`ll-burst ${
              spec.shape === "circle" ? "rounded-full" : "rounded-sm"
            }`}
            style={
              {
                "--ll-dx": `${(x - 0.5) * spec.spreadPx}px`,
                "--ll-dy": `${(y - 0.5) * spec.spreadPx}px`,
                "--ll-rot": `${rot * 720}deg`,
                "--ll-duration": `${2 + speed * 2}s`,
                "--ll-delay": `${delay * (spec.repeatDelaySec ?? 2)}s`,
                backgroundColor: resolveColor(spec.colors[i % spec.colors.length], palette),
              } as CSSProperties
            }
          />
        ));
      })}
    </div>
  );
}
