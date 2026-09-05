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

  return (
    <div
      data-shell
      className="relative select-none"
      style={{ width: 320, height: 210, perspective: 1200 }}
    >
      {/* Back of the envelope, and the lining you see once the flap lifts. */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(160deg, ${lining} 0%, ${paper} 90%)`,
          boxShadow: "0 18px 40px -12px rgba(0,0,0,0.35)",
        }}
      />

      {/* The letter. Slides up and out; the gate animates its `y`. */}
      <div
        data-sheet
        className="absolute left-6 right-6 top-7 rounded-md bg-white p-4 shadow-lg"
        style={{ height: 148, zIndex: 10 }}
      >
        {[0.9, 0.75, 0.85, 0.6].map((w, i) => (
          <div
            key={i}
            className="mb-3 h-2 rounded-full"
            style={{ width: `${w * 100}%`, backgroundColor: alpha(flap, 0.22) }}
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

      {/* The flap, hinged along the top edge. */}
      <div
        data-flap
        className="absolute left-0 top-0 w-full"
        style={{
          height: "58%",
          background: `linear-gradient(180deg, ${flap} 0%, ${alpha(flap, 0.85)} 100%)`,
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          transformOrigin: "top center",
          zIndex: 40,
        }}
      />

      {/* Wax seal, sitting on the flap's point. */}
      <div
        data-seal
        className="absolute left-1/2 flex items-center justify-center rounded-full text-2xl shadow-lg"
        style={{
          top: "52%",
          width: 56,
          height: 56,
          marginLeft: -28,
          marginTop: -28,
          background: `radial-gradient(circle at 35% 30%, ${alpha(lining, 0.95)}, ${flap})`,
          zIndex: 50,
        }}
      >
        {spec.sealEmoji}
      </div>
    </div>
  );
}
