import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The Diwali link preview: the same night the card opens on — stars,
 * fireworks, a lit skyline and a row of diyas — with the red-and-gold envelope
 * from the opening ceremony in the middle, its letter already peeking out and
 * addressed to the recipient.
 *
 * Satori, not a browser: flexbox only, every multi-child div needs
 * `display: flex`, no filters. Shapes are inline SVG; text is HTML on top so
 * it can use the loaded fonts. Never shows the letter body — the preview is a
 * promise, not a spoiler.
 */

const GOLD = "#e0b44c";
const CREAM = "#fbf0d9";
const MAROON = "#8a2a12";

type Weight = 400 | 700;
interface Font {
  name: string;
  data: ArrayBuffer;
  weight: Weight;
  style: "normal" | "italic";
}

/** One Google font, subset to exactly the characters drawn. Null on any failure. */
async function googleFont(family: string, axis: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:${axis}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url, { signal: AbortSignal.timeout(2500) })).text();
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src, { signal: AbortSignal.timeout(2500) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function localFont(file: string): Promise<ArrayBuffer | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public", "fonts", file));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    return null;
  }
}

/** Small deterministic PRNG so a card's sky is the same every time it is fetched. */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function Burst({ cx, cy, r, color, rays = 18 }: { cx: number; cy: number; r: number; color: string; rays?: number }) {
  const lines = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * r * 0.28;
    const y1 = cy + Math.sin(a) * r * 0.28;
    const x2 = cx + Math.cos(a) * r;
    const y2 = cy + Math.sin(a) * r;
    lines.push(<line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeOpacity={0.75} />);
    lines.push(<circle key={`c${i}`} cx={x2} cy={y2} r={3.2} fill={color} />);
    const x3 = cx + Math.cos(a + Math.PI / rays) * r * 0.62;
    const y3 = cy + Math.sin(a + Math.PI / rays) * r * 0.62;
    lines.push(<circle key={`d${i}`} cx={x3} cy={y3} r={1.8} fill="#fff7d6" fillOpacity={0.8} />);
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.15} fill="url(#burstGlow)" />
      {lines}
      <circle cx={cx} cy={cy} r={r * 0.12} fill={color} fillOpacity={0.35} />
      <circle cx={cx} cy={cy} r={3.5} fill="#fff7d6" />
    </g>
  );
}

function DiyaSvg({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="-14" r="26" fill="url(#flameGlow)" />
      <path d="M0 -30 C7 -20 10 -13 6 -6 C4 -2 -4 -2 -6 -6 C-10 -13 -7 -20 0 -30 Z" fill="url(#flame)" />
      <path d="M-22 -4 H22 C19 9 9 15 0 15 C-9 15 -19 9 -22 -4 Z" fill="url(#bowl)" />
      <path d="M-22 -4 H22" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

export async function diwaliOgImage(
  card: { id: string; content: Record<string, string | undefined> },
  size: { width: number; height: number },
): Promise<ImageResponse> {
  const recipient = clip(card.content.recipientName?.trim() || "you", 22);
  const sender = clip(card.content.senderName?.trim() || "someone who loves you", 26);

  const dear = `Dear ${recipient},`;
  const fromLine = `with love, ${sender}`;
  const title = "Happy Diwali";
  const scriptText = `${dear}${fromLine}`;
  const serifText = `${title}— SHUBH DEEPAVALI —letterlove.fun`;

  const [script, serif] = await Promise.all([
    googleFont("Dancing+Script", "wght@700", scriptText).then((f) => f ?? localFont("ValentineCalligraph.otf")),
    googleFont("Playfair+Display", "ital,wght@1,700", serifText),
  ]);

  const fonts: Font[] = [];
  if (script) fonts.push({ name: "Script", data: script, weight: 700, style: "normal" });
  if (serif) fonts.push({ name: "Serif", data: serif, weight: 700, style: "italic" });
  const scriptFamily = script ? "Script" : "serif";
  const serifFamily = serif ? "Serif" : "serif";

  // Long names step the script down rather than overflow the paper.
  const dearSize = dear.length <= 14 ? 58 : dear.length <= 20 ? 48 : 38;
  const fromSize = fromLine.length <= 22 ? 40 : fromLine.length <= 30 ? 34 : 28;

  const rand = rng(card.id);
  const stars = Array.from({ length: 70 }, () => ({
    x: rand() * 1200,
    y: rand() * 380,
    r: 0.6 + rand() * 1.6,
    o: 0.25 + rand() * 0.6,
  }));

  // Envelope box in image coordinates.
  const EX = 300;
  const EY = 128;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#07040e",
        backgroundImage:
          "radial-gradient(70% 55% at 50% 100%, #5a2410 0%, rgba(58,22,12,0.6) 45%, transparent 75%), linear-gradient(180deg, #05030c 0%, #120a22 55%, #1d0c14 100%)",
        fontFamily: serifFamily,
      }}
    >
      {/* Sky, fireworks, skyline, diyas — one SVG behind everything. */}
      <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <radialGradient id="burstGlow">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="flameGlow">
            <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="flame" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="45%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#f97316" />
          </radialGradient>
          <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a160c" stopOpacity="0" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff6dc" fillOpacity={s.o} />
        ))}

        {Burst({ cx: 150, cy: 140, r: 92, color: "#fbbf24" })}
        {Burst({ cx: 1060, cy: 118, r: 80, color: "#f472b6", rays: 16 })}
        {Burst({ cx: 985, cy: 300, r: 46, color: "#fb923c", rays: 12 })}
        {Burst({ cx: 235, cy: 330, r: 40, color: "#a78bfa", rays: 12 })}

        {/* Skyline: rooftops, a temple shikhara, a dome — silhouettes with a few lit windows. */}
        <path
          d="M0 520 H60 V470 H110 V500 H150 V440 H175 L190 410 L205 440 H230 V490 H280 V530 H920 V480 H960 V445 Q985 410 1010 445 V470 H1050 V430 H1065 L1080 395 L1095 430 H1110 V490 H1150 V460 H1200 V630 H0 Z"
          fill="#0b0610"
        />
        {[
          [72, 485], [90, 485], [160, 455], [160, 475], [212, 460], [245, 505], [262, 505],
          [935, 495], [975, 460], [995, 460], [1060, 450], [1060, 470], [1125, 500], [1170, 475],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="7" height="9" rx="1" fill="#fcd34d" fillOpacity={0.55 + ((i * 7) % 4) * 0.1} />
        ))}
        <rect x="0" y="560" width="1200" height="70" fill="url(#ground)" />
        <path d="M0 586 H1200" stroke={GOLD} strokeOpacity="0.35" strokeWidth="1.5" />

        {[70, 190, 1010, 1130].map((x) => (
          <g key={x}>{DiyaSvg({ x, y: 588, s: 1.05 })}</g>
        ))}
      </svg>

      {/* Title. */}
      <div
        style={{
          position: "absolute",
          top: 34,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 15, letterSpacing: 8, color: GOLD, opacity: 0.85 }}>— SHUBH DEEPAVALI —</div>
        <div style={{ display: "flex", fontSize: 50, fontStyle: "italic", color: "#fde68a", marginTop: 2 }}>{title}</div>
      </div>

      {/* The envelope, open, with the letter drawn halfway out. */}
      <svg width="600" height="380" viewBox="0 0 600 380" style={{ position: "absolute", left: EX, top: EY }}>
        <defs>
          <linearGradient id="pocket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a2233" />
            <stop offset="100%" stopColor="#56101f" />
          </linearGradient>
          <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="100%" stopColor="#f1dfba" />
          </linearGradient>
          <radialGradient id="seal" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#f6d77e" />
            <stop offset="55%" stopColor="#c99428" />
            <stop offset="100%" stopColor="#8a5a0e" />
          </radialGradient>
          <radialGradient id="flame2" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="45%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#f97316" />
          </radialGradient>
        </defs>

        {/* Opened flap, behind the letter. */}
        <path d="M10 112 L300 6 L590 112 Z" fill="#3d0a14" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1.5" />
        {/* Envelope back. */}
        <rect x="0" y="110" width="600" height="270" rx="16" fill="#4a0d19" />
        {/* The letter. */}
        <rect x="42" y="38" width="516" height="300" rx="9" fill="url(#paper)" />
        <rect x="54" y="50" width="492" height="276" rx="6" fill="none" stroke="#b8860b" strokeOpacity="0.7" strokeWidth="1.5" />
        <rect x="60" y="56" width="480" height="264" rx="4" fill="none" stroke="#b8860b" strokeOpacity="0.3" strokeWidth="1" />
        <path d="M232 92 H286 M314 92 H368" stroke="#b8860b" strokeOpacity="0.6" strokeWidth="1.2" />
        <path d="M300 86 L306 92 L300 98 L294 92 Z" fill="#b8860b" />
        {/* Front pocket. */}
        <path d="M0 176 L300 292 L600 176 L600 364 Q600 380 584 380 L16 380 Q0 380 0 364 Z" fill="url(#pocket)" />
        <path d="M0 176 L300 292 L600 176" fill="none" stroke={GOLD} strokeWidth="2" strokeOpacity="0.85" />
        <rect x="10" y="120" width="580" height="250" rx="10" fill="none" stroke={GOLD} strokeOpacity="0.3" strokeWidth="1" />
        {/* Wax seal with a diya. */}
        <circle cx="300" cy="292" r="38" fill="url(#seal)" stroke="#c99428" strokeOpacity="0.45" strokeWidth="5" />
        <path d="M300 268 C305 276 308 281 305 287 C303 290 297 290 295 287 C292 281 295 276 300 268 Z" fill="url(#flame2)" />
        <path d="M282 291 H318 C315 302 308 307 300 307 C292 307 285 302 282 291 Z" fill="#7c2d12" />
        <path d="M282 291 H318" stroke="#fcd34d" strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      {/* "Dear …" on the letter, above the pocket's V. */}
      <div
        style={{
          position: "absolute",
          left: EX + 60,
          width: 480,
          top: EY + 104,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: scriptFamily,
          fontSize: dearSize,
          color: MAROON,
        }}
      >
        {dear}
      </div>

      {/* Sender, in gold on the pocket. */}
      <div
        style={{
          position: "absolute",
          left: EX + 20,
          width: 560,
          top: EY + 318,
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: scriptFamily,
          fontSize: fromSize,
          color: GOLD,
        }}
      >
        {fromLine}
      </div>

      {/* Byline. */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          fontSize: 17,
          fontStyle: "italic",
          color: CREAM,
          opacity: 0.55,
        }}
      >
        letterlove.fun
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
