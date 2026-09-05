"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
const MAX_NODES = 28;

/** Below this width the density scales down linearly. */
const FULL_DENSITY_WIDTH = 768;

/**
 * The host box, measured.
 *
 * Both numbers used to be taken from `window`, which is only correct for one
 * of the three places this renders. The share page's layer is viewport-sized,
 * but the editor preview is a ~420px panel and the gallery demo is a modal
 * column — both were getting viewport-scaled density and a viewport-scaled
 * travel distance, so their decor was mostly animating outside the box.
 *
 * Height is rounded to 24px before it reaches state: a mobile URL bar
 * collapsing on scroll resizes the visual viewport by a few pixels at a time,
 * and letting every one of those through would restart the whole layer's
 * animations mid-drift.
 */
function useHostBox(ref: React.RefObject<HTMLDivElement | null>) {
  // Starts at zero so the server and the first client render agree; the CSS
  // `vh` defaults carry the first paint, and the measured span takes over on
  // the next frame rather than mismatching hydration.
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox((prev) => {
        const next = { width, height: Math.round(height / 24) * 24 };
        return prev.width === next.width && prev.height === next.height
          ? prev
          : next;
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return box;
}

function activeInPhase(specPhase: Phase, phase: Phase): boolean {
  return specPhase === "always" || specPhase === phase;
}

/**
 * A theme authors one `sizeRem`; the layer renders a spread around it.
 *
 * Every glyph in a layer used to be the exact same size, which is the single
 * biggest reason the newer themes read as "a few stickers pasted on" rather
 * than as depth. The spread is asymmetric — more headroom above the authored
 * size than below — so widening it makes a layer feel fuller rather than
 * merely noisier.
 */
function sizeRange(sizeRem: number): [number, number] {
  return [sizeRem * 0.72, sizeRem * 1.5];
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
  const host = useRef<HTMLDivElement>(null);
  const { width, height } = useHostBox(host);
  const density = width ? Math.min(1, width / FULL_DENSITY_WIDTH) : 1;

  // Below the fold of the measurement: until the observer has reported, these
  // stay undefined and the stylesheet's `vh` defaults apply.
  const span = height
    ? ({
        "--ll-span-start": `${Math.round(height * 1.1)}px`,
        "--ll-span-end": `${Math.round(height * -0.2)}px`,
      } as CSSProperties)
    : undefined;

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
      ref={host}
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      style={span}
    >
      {layers.map(({ spec, index, count, series }) => {
        if (count === 0 || !activeInPhase(spec.phase, phase)) return null;

        if (spec.kind === "float") {
          const [minSec, maxSec] = spec.speedSec;
          const [minRem, maxRem] = sizeRange(spec.sizeRem ?? 1.5);
          return series.map(([x, speed, delay, scale, jitter], i) => {
            const duration = minSec + speed * (maxSec - minSec);
            return (
            <div
              key={`f${index}-${i}`}
              className={`ll-float ${
                spec.direction === "up" ? "ll-float-up" : "ll-float-down"
              }`}
              style={
                {
                  "--ll-x": `${x * 100}%`,
                  "--ll-duration": `${duration.toFixed(2)}s`,
                  // Negative, and never more than one traversal: the delay
                  // seeks each glyph to a different point along a path it is
                  // already on. A positive delay meant the background started
                  // empty and dribbled in one glyph at a time over the next
                  // minute — the reader opens a letter and watches an empty
                  // page slowly populate, which is the opposite of a backdrop.
                  "--ll-delay": `-${(delay * duration).toFixed(2)}s`,
                  "--ll-opacity": spec.opacity ?? 0.5,
                  // Nearer glyphs are bigger, more opaque and drift faster —
                  // one seeded value driving all three is what stops a layer
                  // from reading as a flat sheet of identical stickers.
                  fontSize: `${(minRem + scale * (maxRem - minRem)).toFixed(2)}rem`,
                  color: spec.tints
                    ? spec.tints[Math.floor(jitter * spec.tints.length)]
                    : undefined,
                } as CSSProperties
              }
            >
              {/* A balloon hangs from its string, so it must not sway
                  independently of it — the whole node moves instead. */}
              {spec.variant === "balloon" ? (
                <>
                  {spec.glyphs[i % spec.glyphs.length]}
                  <span className="ll-balloon-string" />
                </>
              ) : (
                <span
                  className="ll-float-glyph"
                  style={
                    {
                      "--ll-sway": `${(6 + jitter * 22).toFixed(1)}px`,
                      "--ll-tilt": `${(4 + jitter * 14).toFixed(1)}deg`,
                      "--ll-sway-duration": `${(3.5 + speed * 4).toFixed(1)}s`,
                    } as CSSProperties
                  }
                >
                  {spec.glyphs[i % spec.glyphs.length]}
                </span>
              )}
            </div>
            );
          });
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
                // Negative for the same reason as the floats above, and with
                // one worse symptom of its own: a burst particle waiting out a
                // positive delay was a bare 10px square sitting dead centre of
                // the card, at full opacity, on top of the title.
                "--ll-delay": `-${(delay * (spec.repeatDelaySec ?? 2)).toFixed(2)}s`,
                backgroundColor: resolveColor(spec.colors[i % spec.colors.length], palette),
              } as CSSProperties
            }
          />
        ));
      })}
    </div>
  );
}
