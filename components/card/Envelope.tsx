"use client";

import type { EnvelopeSpec, ThemePalette } from "@/lib/theme";
import { alpha, resolveColor } from "@/lib/theme";

/**
 * The envelope, as pure visuals. All state, sequencing and accessibility live
 * in EnvelopeGate; this file only knows how to look like an envelope.
 *
 * The moving parts are addressed by `data-*` attributes rather than refs so the
 * gate can drive the whole open sequence through one scoped `useAnimate`.
 *
 * Everything inside is sized in percentages against one `aspect-ratio` box, so
 * the whole envelope scales with `--ll-envelope-w`. The previous version was
 * pinned at 320×210, which on a 360px phone left ~20px of breathing room either
 * side and pushed the hint copy against the edge.
 *
 * NOTE: no `backdrop-filter` anywhere in here, deliberately. The site's
 * `.glass-panel` uses it, and a blurred layer under a 3D transform janks badly
 * on iOS Safari — which is most of the audience. Glass goes back on after the
 * reveal completes, on the card itself.
 */
export default function Envelope({
  spec,
  palette,
}: {
  spec: EnvelopeSpec;
  palette: ThemePalette;
}) {
  const paper = resolveColor(spec.paperColor, palette, "secondary");
  const flap = resolveColor(spec.flapColor, palette, "primary");
  const lining = resolveColor(spec.liningColor, palette, "accent");
  const glow = resolveColor("glow", palette, "glow");

  return (
    <div
      className="relative select-none"
      style={{ width: "var(--ll-envelope-w, 320px)" }}
    >
      {/*
        Three nested boxes, and the nesting is load-bearing:

          .ll-envelope-idle  — the CSS idle float
          [data-shell]       — what the gate's open timeline transforms
          children           — the parts the timeline addresses individually

        The idle cannot live on `[data-shell]`. A running CSS animation beats an
        inline style in the cascade, so the float would simply overwrite every
        transform Motion wrote and the envelope would never leave.
      */}
      <div className="ll-envelope-idle relative w-full">
        <div
          data-shell
          className="relative w-full"
          style={{ aspectRatio: "320 / 210", perspective: 1200 }}
        >
          {/* Halo, inside the shell so it leaves with it. First child and
              `z-index: auto`, so DOM order alone keeps it behind the paper. */}
          <div
            aria-hidden
            className="ll-seal-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{
              width: "150%",
              aspectRatio: "1",
              background: `radial-gradient(circle, ${alpha(glow, 0.55)} 0%, transparent 68%)`,
            }}
          />

          {/* Back of the envelope, and the lining you see once the flap lifts. */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: `linear-gradient(160deg, ${lining} 0%, ${paper} 90%)`,
              boxShadow: "0 18px 40px -12px rgba(0,0,0,0.35)",
            }}
          />

          {/* The letter. Slides up and out; the gate animates its transform. */}
          <div
            data-sheet
            className="absolute rounded-md bg-white shadow-lg"
            style={{
              left: "7.5%",
              right: "7.5%",
              top: "13.3%",
              height: "70.5%",
              padding: "5%",
              zIndex: 10,
            }}
          >
            {[0.9, 0.75, 0.85, 0.6].map((w, i) => (
              <div
                key={i}
                className="mb-[6%] h-[4.5%] rounded-full"
                style={{
                  width: `${w * 100}%`,
                  backgroundColor: alpha(flap, 0.22),
                }}
              />
            ))}
          </div>

          {/* Front pocket: the V that the letter sits behind. */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: `linear-gradient(200deg, ${paper} 0%, ${alpha(flap, 0.35)} 100%)`,
              clipPath: "polygon(0 18%, 50% 62%, 100% 18%, 100% 100%, 0 100%)",
              zIndex: 30,
            }}
          />

          {/* The flap, hinged along the top edge. `backface-visibility` matters:
              past 90° of rotateX the browser would otherwise show the flap's
              mirrored front face instead of letting it read as its own back. */}
          <div
            data-flap
            className="absolute left-0 top-0 w-full"
            style={{
              height: "58%",
              background: `linear-gradient(180deg, ${flap} 0%, ${alpha(flap, 0.85)} 100%)`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transformOrigin: "top center",
              backfaceVisibility: "hidden",
              zIndex: 40,
            }}
          >
            {/* Crease along the hinge, so the fold has an edge to turn on. */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: alpha("#000000", 0.12) }}
            />
          </div>

          {/* Wax seal, sitting on the flap's point.
              The centring translate lives on a wrapper so `data-seal` owns no
              transform of its own — the gate animates its scale, and Motion
              writes a whole `transform`, which would otherwise drop the -50%
              and shunt the seal off the flap's point mid-animation. */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "52%",
              width: "17.5%",
              transform: "translate(-50%, -50%)",
              zIndex: 50,
            }}
          >
            <div
              data-seal
              className="flex aspect-square w-full items-center justify-center rounded-full text-[clamp(0.9rem,4.5vw,1.5rem)]"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${alpha(lining, 0.95)}, ${flap})`,
                boxShadow: `0 6px 14px -4px rgba(0,0,0,0.45), inset 0 -2px 6px ${alpha("#000000", 0.18)}`,
              }}
            >
              {spec.sealEmoji}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
