"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useAnimate } from "motion/react";
import { Diya, PaperBackground } from "./DiwaliLetter";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const EASE_OUT_SOFT = [0.16, 1, 0.3, 1] as const;

/** Envelope colours: deep sindoor red with gold foil. */
const RED_HI = "#9b2335";
const RED = "#6e1626";
const RED_LO = "#3d0a14";
const GOLD = "#e0b44c";

/** Seal diameter, as a fraction of the envelope's width. */
const SEAL = 0.17;

const DOTS =`radial-gradient(circle, rgba(224,180,76,0.38) 1.1px, transparent 1.6px) 0 0 / 13px 13px`;

export interface LetterCeremonyProps {
  /** The real letter's measured box — the sheet folded here is exactly that size. */
  width: number;
  height: number;
  to: string;
  onDone: () => void;
}

/**
 * The handover from scene to letter: an envelope arrives, its seal breaks, the
 * flap lifts, a folded sheet is drawn out while the envelope is set down, and
 * the sheet opens in two folds into the very letter underneath.
 *
 * The sheet is the letter's own stationery sliced into three panels, sized to
 * the measured letter, so when the last fold lands the real letter (identical,
 * still wordless) simply takes its place and the words begin.
 *
 * One motion timeline with absolute offsets; transforms and opacity only.
 */
export default function LetterCeremony({ width: W, height: H, to, onDone }: LetterCeremonyProps) {
  const [scope, animate] = useAnimate();
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  const h = H / 3;
  const EW = W;
  const EH = Math.round(W * 0.64);
  // Low enough that the opened flap (0.58·EH tall, swung up) stays on screen.
  const TOP = Math.round(EH * 0.5);
  // Folded, the sheet has to fit inside the pocket.
  const s0 = Math.min(0.86, (EH * 0.72) / h);
  const startY = TOP + EH * 0.15;
  // Far enough down that the sheet, back at the top, has fully cleared it.
  const drop = Math.max(48, h + 36 - TOP);

  useEffect(() => {
    let cancelled = false;
    const playback = animate([
      ["[data-cer]", { opacity: [0, 1], transform: ["translate3d(0,70px,0) rotate(-3deg)", "translate3d(0,0,0) rotate(0deg)"] }, { duration: 0.9, ease: EASE_OUT_SOFT, at: 0 }],
      [
        "[data-seal]",
        { transform: ["scale(1)", "scale(1.16)", "scale(1.1)", "scale(0.4) rotate(-14deg)"], opacity: [1, 1, 1, 0] },
        { duration: 0.7, ease: EASE_OUT, at: 1.05, times: [0, 0.35, 0.5, 1] },
      ],
      ["[data-burst]", { opacity: [0, 1, 0], transform: ["scale(0.4)", "scale(1.3)", "scale(1.8)"] }, { duration: 0.8, ease: EASE_OUT, at: 1.4 }],
      [
        "[data-flap]",
        { transform: ["perspective(900px) rotateX(0deg)", "perspective(900px) rotateX(180deg)"] },
        { duration: 0.8, ease: EASE_IN_OUT, at: 1.45 },
      ],
      // Past vertical the opened flap belongs behind the sheet being drawn out.
      ["[data-flapwrap]", { zIndex: [4, 1] }, { duration: 0.01, at: 1.85 }],
      ["[data-sheet]", { opacity: [0, 1] }, { duration: 0.25, at: 1.75 }],
      [
        "[data-sheet]",
        { transform: [`translate3d(0,${startY}px,0) scale(${s0})`, `translate3d(0,${startY - 14}px,0) scale(${s0})`, "translate3d(0,0px,0) scale(1)"] },
        { duration: 1.35, ease: EASE_IN_OUT, at: 2.15, times: [0, 0.25, 1] },
      ],
      ["[data-env]", { transform: ["translate3d(0,0px,0)", `translate3d(0,${drop}px,0)`] }, { duration: 1.2, ease: EASE_IN_OUT, at: 2.35 }],
      ["[data-env]", { opacity: [1, 0] }, { duration: 0.55, ease: EASE_OUT, at: 3.1 }],
      ["[data-cover]", { opacity: [1, 0] }, { duration: 0.45, at: 3.45 }],
      [
        "[data-p1]",
        { transform: ["translateZ(1px) rotateX(180deg)", "translateZ(0px) rotateX(0deg)"] },
        { duration: 0.85, ease: EASE_IN_OUT, at: 3.6 },
      ],
      ["[data-p1-shade]", { opacity: [0.55, 0] }, { duration: 0.85, ease: EASE_IN_OUT, at: 3.6 }],
      [
        "[data-p2]",
        { transform: ["translateZ(-1px) rotateX(-180deg)", "translateZ(0px) rotateX(0deg)"] },
        { duration: 0.85, ease: EASE_IN_OUT, at: 4.3 },
      ],
      ["[data-p2-shade]", { opacity: [0.55, 0] }, { duration: 0.85, ease: EASE_IN_OUT, at: 4.3 }],
    ]);
    playback.then(
      () => !cancelled && done.current(),
      () => {},
    );
    return () => {
      cancelled = true;
      playback.stop();
    };
  }, [animate, startY, s0, drop]);

  const slice = (k: number) => (
    <div className="absolute left-0" style={{ top: -k * h, width: W, height: H }}>
      <PaperBackground />
    </div>
  );

  const face = "absolute inset-0 overflow-hidden backface-hidden";
  const panel: CSSProperties = { position: "absolute", left: 0, width: W, height: h, transformStyle: "preserve-3d", transformOrigin: "top center" };

  return (
    <div
      ref={scope}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto"
      style={{ width: W, height: H }}
    >
      <div data-cer className="absolute inset-0" style={{ opacity: 0 }}>
        {/* Envelope back, and the lining seen once the flap lifts. */}
        <div
          data-env
          className="absolute left-0 rounded-[14px]"
          style={{
            top: TOP,
            width: EW,
            height: EH,
            zIndex: 1,
            background: `${DOTS}, linear-gradient(180deg, ${RED_LO}, #57101e)`,
            boxShadow: "0 30px 60px -18px rgba(0,0,0,0.8), 0 0 120px -20px rgba(251,191,36,0.35)",
          }}
        />

        {/* The folded letter. Panel 0 is the top third, panel 1 (hinged to its
            bottom edge) is folded up over it, and panel 2 (hinged to panel 1)
            is folded over that — outermost, wearing the "For …" cover. */}
        <div
          data-sheet
          className="absolute left-0 top-0"
          style={{
            width: W,
            height: h,
            zIndex: 2,
            opacity: 0,
            transformOrigin: "top center",
            transform: `translate3d(0,${startY}px,0) scale(${s0})`,
            perspective: 2200,
          }}
        >
          <div style={{ ...panel, top: 0 }} className="rounded-t-[14px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            <div className={`${face} rounded-t-[14px]`}>{slice(0)}</div>
          </div>

          <div data-p1 style={{ ...panel, top: h, transform: "translateZ(1px) rotateX(180deg)" }}>
            <div className={face}>
              {slice(1)}
              <div data-p1-shade className="absolute inset-0 bg-linear-to-b from-[#5a3410]/60 to-transparent" style={{ opacity: 0.55 }} />
            </div>
            <div className={face} style={{ transform: "rotateX(180deg)" }}>
              <PaperBackground back />
            </div>

            <div data-p2 style={{ ...panel, top: h, transform: "translateZ(-1px) rotateX(-180deg)" }}>
              <div className={`${face} rounded-b-[14px]`}>
                {slice(2)}
                <div data-p2-shade className="absolute inset-0 bg-linear-to-b from-[#5a3410]/60 to-transparent" style={{ opacity: 0.55 }} />
                <div data-cover className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ backgroundImage: "linear-gradient(180deg, #f6e7c6, #ecd6a6)" }}>
                  <Diya size={34} />
                  <p className="font-handwriting text-3xl" style={{ color: "#8a2a12" }}>
                    {to ? `For ${to}` : "For you"}
                  </p>
                </div>
              </div>
              <div className={`${face} rounded-b-[14px]`} style={{ transform: "rotateX(180deg)" }}>
                <PaperBackground back />
              </div>
            </div>
          </div>
        </div>

        {/* Front pocket. */}
        <div data-env className="absolute left-0" style={{ top: TOP, width: EW, height: EH, zIndex: 3 }}>
          <div
            className="absolute inset-0 rounded-[14px]"
            style={{
              clipPath: "polygon(0 30%, 50% 66%, 100% 30%, 100% 100%, 0 100%)",
              background: `linear-gradient(180deg, ${RED} 0%, #561020 100%)`,
            }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
            <polyline points="0,30 50,66 100,30" stroke={GOLD} strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeOpacity=".8" />
            <rect x="2.2" y="3.4" width="95.6" height="93.2" rx="2" stroke={GOLD} strokeOpacity=".45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="absolute inset-x-0 bottom-[9%] text-center font-handwriting text-2xl sm:text-3xl" style={{ color: GOLD, textShadow: "0 0 18px rgba(224,180,76,0.45)" }}>
            {to ? `For ${to}` : "For you"}
          </p>
        </div>

        {/* Flap: front is the envelope red, back is the dotted lining. The
            wrapper travels with the envelope and owns the stacking switch;
            the flap inside owns the hinge. */}
        <div data-env data-flapwrap className="absolute left-0" style={{ top: TOP, width: EW, height: EH * 0.58, zIndex: 4 }}>
        <div
          data-flap
          className="absolute inset-0"
          style={{
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            transform: "perspective(900px) rotateX(0deg)",
          }}
        >
          <div
            className="absolute inset-0 backface-hidden"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: `linear-gradient(180deg, ${RED_HI}, ${RED})` }}
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
              <polyline points="0,0 50,100 100,0" stroke={GOLD} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <polyline points="8,0 50,86 92,0" stroke={GOLD} strokeOpacity=".4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div
            className="absolute inset-0 backface-hidden"
            style={{ transform: "rotateX(180deg)", clipPath: "polygon(50% 0, 100% 100%, 0 100%)", background: `${DOTS}, linear-gradient(0deg, #4a0d19, ${RED_LO})` }}
          />
        </div>
        </div>

        {/* Wax seal on the flap's point. Placed with left/top, not a centring
            translate: the envelope's drop writes this wrapper's transform. */}
        <div
          data-env
          className="absolute"
          style={{ left: (EW - SEAL * EW) / 2, top: TOP + EH * 0.58 - (SEAL * EW) / 2, width: SEAL * EW, zIndex: 5 }}
        >
          <div data-burst className="absolute -inset-6 rounded-full" style={{ opacity: 0, background: "radial-gradient(circle, rgba(255,236,170,0.9), rgba(251,191,36,0.35) 40%, transparent 70%)" }} />
          <div
            data-seal
            className="relative grid aspect-square w-full place-items-center rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 30%, #f6d77e, #c99428 55%, #8a5a0e)`,
              boxShadow: "0 8px 18px -6px rgba(0,0,0,0.6), inset 0 -3px 8px rgba(90,50,0,0.5), 0 0 0 3px rgba(201,148,40,0.35)",
            }}
          >
            <Diya size={Math.round(EW * 0.11)} />
          </div>
        </div>
      </div>
    </div>
  );
}
