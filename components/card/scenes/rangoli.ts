// Scene 3 — Rangoli.
//
// A dark courtyard floor seen from above, one unlit diya in the middle. The
// recipient lights it, and a rangoli pours itself outward around the flame,
// grain by grain, every segment at once the way a kaleidoscope turns. Its
// pattern and colours are seeded from the letter, so no two recipients get the
// same one — and the ring near the edge is their own name, written in chalk.

import {
  clamp,
  damp,
  ensureFont,
  fonts,
  glow,
  hashString,
  mulberry32,
  offscreen,
  sampleDrawing,
  stamp,
  type SceneFactory,
} from "./engine";
import { drawFlame } from "./diyaChain";

type ShapeKind = "petal" | "leaf" | "drop" | "dot" | "band" | "scallop";

interface Shape {
  kind: ShapeKind;
  r0: number;
  r1: number;
  /** Half angular width. */
  aw: number;
  color: string;
  offset: number;
}

interface Ring {
  shapes: Shape[];
  dur: number;
  text?: boolean;
}

const PALETTES = [
  { a: "#e0218a", b: "#ffb000", c: "#ff6a00", d: "#1f9e89", e: "#2f3cbf", f: "#2fbf71", chalk: "#fff4e2" },
  { a: "#d7263d", b: "#ffd23f", c: "#f46036", d: "#3bceac", e: "#5b2a86", f: "#0ead69", chalk: "#fffaf0" },
  { a: "#ff4f8b", b: "#ffc300", c: "#ff7b00", d: "#00a6a6", e: "#1b3b8f", f: "#7cb518", chalk: "#fff6e8" },
];

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => clamp(Math.round(v + amt * 255), 0, 255);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

function shapePath(s: Shape, R: number): Path2D {
  const p = new Path2D();
  const r0 = s.r0 * R;
  const r1 = s.r1 * R;
  const mid = (r0 + r1) / 2;
  const wd = mid * Math.sin(s.aw);
  switch (s.kind) {
    case "petal": {
      const L = r1 - r0;
      p.moveTo(r0, 0);
      p.bezierCurveTo(r0 + L * 0.2, -wd * 1.35, r0 + L * 0.78, -wd * 0.95, r1, 0);
      p.bezierCurveTo(r0 + L * 0.78, wd * 0.95, r0 + L * 0.2, wd * 1.35, r0, 0);
      break;
    }
    case "leaf": {
      const L = r1 - r0;
      p.moveTo(r0, 0);
      p.bezierCurveTo(r0 + L * 0.3, -wd, r0 + L * 0.7, -wd, r1, 0);
      p.bezierCurveTo(r0 + L * 0.7, wd, r0 + L * 0.3, wd, r0, 0);
      break;
    }
    case "drop": {
      const rr = Math.min(wd, (r1 - r0) * 0.36);
      const c = r1 - rr;
      p.moveTo(r0, 0);
      p.bezierCurveTo(r0 + (c - r0) * 0.55, -rr * 0.35, c - rr * 0.9, -rr, c, -rr);
      p.arc(c, 0, rr, -Math.PI / 2, Math.PI / 2);
      p.bezierCurveTo(c - rr * 0.9, rr, r0 + (c - r0) * 0.55, rr * 0.35, r0, 0);
      break;
    }
    case "dot":
      p.arc(mid, 0, (r1 - r0) / 2, 0, Math.PI * 2);
      break;
    case "band":
      p.arc(0, 0, r1, -s.aw, s.aw);
      p.arc(0, 0, r0, s.aw, -s.aw, true);
      break;
    case "scallop":
      p.arc(r0, 0, r1 - r0, -Math.PI / 2, Math.PI / 2);
      break;
  }
  p.closePath();
  return p;
}

export const createRangoli: SceneFactory = (stage, io) => {
  const { ctx } = stage;
  const seed = hashString(`${io.seed}:rangoli:${io.to}`);
  const rand = mulberry32(seed);
  const F = fonts();
  const n = [8, 8, 12, 10][seed % 4];
  const P = PALETTES[(seed >>> 3) % PALETTES.length];
  const seg = Math.PI / n;

  // The pattern, inside out. Every ring is poured in turn.
  const rings: Ring[] = [
    { dur: 0.7, shapes: [{ kind: "band", r0: 0.1, r1: 0.145, aw: seg + 0.01, color: P.b, offset: 0 }] },
    {
      dur: 1.1,
      shapes: [
        { kind: "petal", r0: 0.15, r1: 0.33, aw: seg * 0.92, color: P.a, offset: 0 },
        { kind: "petal", r0: 0.17, r1: 0.28, aw: seg * 0.45, color: P.chalk, offset: 0 },
      ],
    },
    {
      dur: 0.6,
      shapes: [
        { kind: "dot", r0: 0.335, r1: 0.355, aw: 0, color: P.chalk, offset: 0 },
        { kind: "dot", r0: 0.335, r1: 0.355, aw: 0, color: P.chalk, offset: seg },
      ],
    },
    {
      dur: 1.1,
      shapes: [
        { kind: "leaf", r0: 0.36, r1: 0.53, aw: seg * 0.68, color: P.b, offset: 0 },
        { kind: "leaf", r0: 0.37, r1: 0.5, aw: seg * 0.55, color: P.c, offset: seg },
      ],
    },
    {
      dur: 0.9,
      shapes: [
        { kind: "band", r0: 0.545, r1: 0.59, aw: seg + 0.01, color: P.e, offset: 0 },
        { kind: "dot", r0: 0.559, r1: 0.576, aw: 0, color: P.chalk, offset: seg / 2 },
        { kind: "dot", r0: 0.559, r1: 0.576, aw: 0, color: P.chalk, offset: -seg / 2 },
      ],
    },
    {
      dur: 1.3,
      shapes: [
        { kind: "drop", r0: 0.6, r1: 0.83, aw: seg * 0.62, color: P.f, offset: 0 },
        { kind: "drop", r0: 0.63, r1: 0.78, aw: seg * 0.36, color: P.a, offset: 0 },
        { kind: "leaf", r0: 0.62, r1: 0.76, aw: seg * 0.26, color: P.d, offset: seg },
        { kind: "dot", r0: 0.835, r1: 0.865, aw: 0, color: P.b, offset: 0 },
      ],
    },
    { dur: 1.7, text: true, shapes: [] },
    {
      dur: 1.1,
      shapes: [
        { kind: "scallop", r0: 0.965, r1: 1.03, aw: 0, color: P.c, offset: 0 },
        { kind: "scallop", r0: 0.965, r1: 1.03, aw: 0, color: P.a, offset: seg },
        { kind: "dot", r0: 1.05, r1: 1.075, aw: 0, color: P.b, offset: 0 },
        { kind: "dot", r0: 1.05, r1: 1.075, aw: 0, color: P.b, offset: seg },
      ],
    },
  ];

  let w = 0;
  let h = 0;
  let cx = 0;
  let cy = 0;
  let R = 100;
  let floor: HTMLCanvasElement;
  let art: ReturnType<typeof offscreen>;

  // Grains, flattened per ring: x, y relative to centre; colour; size.
  let grains: { x: Float32Array; y: Float32Array; c: string[]; s: Float32Array }[] = [];
  let ready = false;

  let time = 0;
  let litT = Infinity;
  let ring = 0;
  let ringDrawn = 0;
  let ringProgress = 0;
  let held = false;
  let doneT = Infinity;
  let finaleSent = false;
  let hinted = false;

  interface Puff {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
  }
  const puffs: Puff[] = [];
  let lastPuff = { x: 0, y: 0 };

  const outerDiyas: { a: number; litAt: number }[] = Array.from({ length: 8 }, (_, i) => ({
    a: (i / 8) * Math.PI * 2 - Math.PI / 2 + Math.PI / 8,
    litAt: Infinity,
  }));

  function buildFloor() {
    const c = offscreen(w, h);
    c.ctx.fillStyle = "#24140f";
    c.ctx.fillRect(0, 0, w, h);
    const r2 = mulberry32(seed ^ 0x5f);
    for (let i = 0; i < (w * h) / 60; i++) {
      c.ctx.fillStyle = r2() < 0.5 ? "rgba(0,0,0,0.18)" : "rgba(255,210,170,0.05)";
      c.ctx.fillRect(r2() * w, r2() * h, 1 + r2() * 1.5, 1 + r2() * 1.5);
    }
    // Old stone slabs.
    c.ctx.strokeStyle = "rgba(0,0,0,0.35)";
    c.ctx.lineWidth = 1.5;
    const tile = Math.max(120, R * 0.9);
    for (let x = (cx % tile) - tile; x < w + tile; x += tile) {
      c.ctx.beginPath();
      c.ctx.moveTo(x, 0);
      c.ctx.lineTo(x, h);
      c.ctx.stroke();
    }
    for (let y = (cy % tile) - tile / 2; y < h + tile; y += tile) {
      c.ctx.beginPath();
      c.ctx.moveTo(0, y);
      c.ctx.lineTo(w, y);
      c.ctx.stroke();
    }
    floor = c.canvas;
  }

  async function buildGrains() {
    ready = false;
    const D = clamp(0.55 * Math.pow(300 / R, 0.4), 0.35, 0.8);
    const probe = offscreen(2, 2).ctx;
    const out: typeof grains = [];
    const shadeCache = new Map<string, string[]>();
    const shadesOf = (hex: string) => {
      let s = shadeCache.get(hex);
      if (!s) {
        s = [shade(hex, -0.12), shade(hex, -0.04), shade(hex, 0.04), shade(hex, 0.12)];
        shadeCache.set(hex, s);
      }
      return s;
    };

    for (const rg of rings) {
      const xs: number[] = [];
      const ys: number[] = [];
      const cs: string[] = [];
      const ss: number[] = [];
      const keys: number[] = [];

      if (rg.text) {
        const font = (px: number) => `700 ${px}px ${F.serif}`;
        await ensureFont(font(20));
        const rt = R * 0.905;
        const name = io.to.trim() || "You";
        const text = `${name}  •  Shubh Deepavali  •  `;
        probe.font = font(100);
        const circ = Math.PI * 2 * rt * 0.97;
        let px = (100 * circ) / probe.measureText(text).width;
        let full = text;
        const band = R * 0.095;
        if (px > band) {
          // Short name: repeat rather than blow the text up past the ring.
          const reps = Math.ceil(px / band);
          full = text.repeat(reps);
          px = (100 * circ) / probe.measureText(full).width;
        }
        px = clamp(px, 9, band);
        probe.font = font(px);
        const nameW = probe.measureText(name).width;
        const start = -Math.PI / 2 - nameW / 2 / rt;
        const box = Math.ceil(R * 2.3);
        // Small rings (phones) need every pixel to keep chalk letters legible.
        const pts = sampleDrawing(
          box,
          box,
          px < 18 ? 1 : 2,
          (c) => {
            c.font = font(px);
            c.fillStyle = "#fff";
            c.textBaseline = "middle";
            c.textAlign = "left";
            let a = start;
            for (const ch of full) {
              const cw = c.measureText(ch).width;
              c.save();
              c.translate(box / 2 + Math.cos(a) * rt, box / 2 + Math.sin(a) * rt);
              c.rotate(a + Math.PI / 2);
              c.fillText(ch, 0, 0);
              c.restore();
              a += cw / rt;
            }
          },
          60000,
        );
        const sh = shadesOf(P.chalk);
        const jitter = px < 18 ? 0.5 : 1.2;
        for (const p of pts) {
          const x = p.x - box / 2 + (rand() - 0.5) * jitter;
          const y = p.y - box / 2 + (rand() - 0.5) * jitter;
          xs.push(x);
          ys.push(y);
          cs.push(sh[Math.floor(rand() * 4)]);
          ss.push(px < 18 ? 0.9 + rand() * 0.5 : 1.1 + rand() * 0.9);
          // Written clockwise from the start of the name.
          let a = Math.atan2(y, x) - start;
          a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          keys.push(a / (Math.PI * 2) + rand() * 0.01);
        }
      } else {
        for (const s of rg.shapes) {
          const path = shapePath(s, R);
          const r0 = s.r0 * R;
          const r1 = s.r1 * R;
          const reach = s.kind === "scallop" ? r1 - r0 : s.kind === "dot" ? (r1 - r0) / 2 : 0;
          const halfW = s.kind === "dot" || s.kind === "scallop" ? reach : r1 * Math.sin(Math.min(s.aw * 1.4, Math.PI / 2));
          const minX = s.kind === "band" ? r0 * Math.cos(s.aw) : r0 - reach;
          const maxX = s.kind === "scallop" ? r1 : r1 + reach;
          const minY = -halfW;
          const tries = Math.ceil((maxX - minX) * (2 * halfW) * D);
          const sh = shadesOf(s.color);
          for (let i = 0; i < tries; i++) {
            const x = minX + rand() * (maxX - minX);
            const y = minY + rand() * 2 * halfW;
            if (!probe.isPointInPath(path, x, y)) continue;
            const size = 1.1 + rand() * 1.1;
            const color = sh[Math.floor(rand() * 4)];
            const key = 0.7 * clamp((Math.hypot(x, y) - s.r0 * R) / Math.max(1, r1 - r0)) + 0.3 * rand();
            for (let k = 0; k < n; k++) {
              const a = s.offset + (k / n) * Math.PI * 2;
              const ca = Math.cos(a);
              const sa = Math.sin(a);
              xs.push(x * ca - y * sa);
              ys.push(x * sa + y * ca);
              cs.push(color);
              ss.push(size);
              keys.push(key);
            }
          }
        }
      }

      // Pour order: shapes in a ring are poured together, inside-out.
      const order = keys.map((_, i) => i).sort((a, b) => keys[a] - keys[b]);
      out.push({
        x: Float32Array.from(order, (i) => xs[i]),
        y: Float32Array.from(order, (i) => ys[i]),
        c: order.map((i) => cs[i]),
        s: Float32Array.from(order, (i) => ss[i]),
      });
    }
    grains = out;
    ready = true;
    // A resize mid-pour redraws everything already poured at the new size.
    art.ctx.clearRect(0, 0, w, h);
    for (let r = 0; r < ring; r++) drawGrains(r, 0, grains[r].x.length);
    if (ring < grains.length) {
      ringDrawn = 0;
      drawGrains(ring, 0, Math.floor(ringProgress * grains[ring].x.length));
      ringDrawn = Math.floor(ringProgress * grains[ring].x.length);
    }
  }

  function drawGrains(r: number, from: number, to: number) {
    const g = grains[r];
    const c = art.ctx;
    let last = "";
    for (let i = from; i < to; i++) {
      if (g.c[i] !== last) {
        last = g.c[i];
        c.fillStyle = last;
      }
      const s = g.s[i];
      c.fillRect(cx + g.x[i] - s / 2, cy + g.y[i] - s / 2, s, s);
    }
  }

  function layout() {
    w = stage.w;
    h = stage.h;
    cx = w / 2;
    cy = h * 0.45;
    R = Math.min(w * 0.44, h * 0.33);
    art = offscreen(w, h, Math.min(2, stage.dpr));
    buildFloor();
    void buildGrains();
  }

  layout();
  io.hint("Tap the diya to light it");

  function lightCentre() {
    if (litT < Infinity) return;
    litT = time;
    io.sound.ignite();
  }

  function finishPour() {
    doneT = time;
    io.sound.setHiss(0);
    outerDiyas.forEach((d, i) => (d.litAt = time + 0.35 + i * 0.2));
    io.hint("");
  }

  const diyaScale = () => clamp(R / 260, 0.45, 1);

  function drawTopDiya(x: number, y: number, k: number, size: number, flicker: number, lit: boolean) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(x + 3, y + 4, size * 1.05, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size * 1.1);
    g.addColorStop(0, lit ? "#d9773d" : "#6a3420");
    g.addColorStop(1, lit ? "#6b2a10" : "#2a120a");
    ctx.fillStyle = g;
    ctx.beginPath();
    // Bowl with a pinched spout pointing up the screen.
    ctx.moveTo(x, y - size * 1.45);
    ctx.bezierCurveTo(x + size * 0.45, y - size * 0.9, x + size, y - size * 0.6, x + size, y);
    ctx.arc(x, y, size, 0, Math.PI);
    ctx.bezierCurveTo(x - size, y - size * 0.6, x - size * 0.45, y - size * 0.9, x, y - size * 1.45);
    ctx.fill();
    ctx.fillStyle = lit ? "#3d1505" : "#160803";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.72, 0, Math.PI * 2);
    ctx.fill();
    if (lit) {
      ctx.fillStyle = "rgba(255,200,100,0.35)";
      ctx.beginPath();
      ctx.ellipse(x - size * 0.2, y - size * 0.2, size * 0.3, size * 0.14, -0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (k > 0) drawFlame(ctx, x, y - size * 1.3, size * 1.15, k, time, flicker);
  }

  return {
    resize() {
      layout();
    },

    down(x, y) {
      held = true;
      lastPuff = { x, y };
      if (litT === Infinity) {
        if (Math.hypot(x - cx, y - cy) < Math.max(56, R * 0.25)) lightCentre();
        return;
      }
    },

    move(x, y, _e, pressed) {
      if (!pressed || litT === Infinity) return;
      const d = Math.hypot(x - lastPuff.x, y - lastPuff.y);
      if (d < 14) return;
      lastPuff = { x, y };
      const colors = [P.a, P.b, P.c, P.d, P.f];
      for (let i = 0; i < 3; i++) {
        puffs.push({
          x: x + (rand() - 0.5) * 20,
          y: y + (rand() - 0.5) * 20,
          vx: (rand() - 0.5) * 60,
          vy: (rand() - 0.5) * 60 - 10,
          life: 1.4 + rand() * 0.8,
          color: colors[Math.floor(rand() * colors.length)],
          size: 50 + rand() * 70,
        });
      }
      if (puffs.length > 160) puffs.splice(0, puffs.length - 160);
    },

    up() {
      held = false;
    },

    key() {
      if (litT === Infinity) lightCentre();
      else held = !held;
    },

    frame(dt, t) {
      time = t;

      // --- pour -----------------------------------------------------------
      if (litT < Infinity && ready && doneT === Infinity && time - litT > 0.7) {
        if (!hinted) {
          hinted = true;
          io.hint("Hold to pour faster · swipe to throw gulal");
        }
        const rg = rings[ring];
        const g = grains[ring];
        ringProgress = Math.min(1, ringProgress + (dt / rg.dur) * (held ? 3.2 : 1));
        const to = Math.floor(ringProgress * g.x.length);
        drawGrains(ring, ringDrawn, to);
        ringDrawn = to;
        io.sound.setHiss(held ? 0.28 : 0.14, 1900);
        if (ringProgress >= 1) {
          io.sound.bell([523.25, 587.33, 659.25, 783.99, 880, 987.77, 1046.5, 1174.66][ring % 8], 0.08);
          ring++;
          ringProgress = 0;
          ringDrawn = 0;
          if (ring >= rings.length) finishPour();
        }
      }

      for (const d of outerDiyas) {
        if (d.litAt <= time && d.litAt > time - dt) io.sound.ignite();
      }
      const lastOuter = outerDiyas[outerDiyas.length - 1].litAt;
      if (!finaleSent && time > lastOuter + 1.2) {
        finaleSent = true;
        io.sound.chime();
        io.finale();
      }

      // --- draw -----------------------------------------------------------
      ctx.drawImage(floor, 0, 0, w, h);
      ctx.drawImage(art.canvas, 0, 0, w, h);

      // Gulal clouds.
      for (const p of puffs) {
        p.life -= dt;
        p.vx *= damp(0.96, dt);
        p.vy *= damp(0.96, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.size += dt * 30;
      }
      for (let i = puffs.length - 1; i >= 0; i--) if (puffs[i].life <= 0) puffs.splice(i, 1);
      for (const p of puffs) stamp(ctx, glow(p.color, 0.4), p.x, p.y, p.size, clamp(p.life) * 0.28);

      // Darkness, with the diya as the only light until the ring of diyas.
      const flick = 1 + 0.035 * Math.sin(t * 10) + 0.02 * Math.sin(t * 23);
      const lit0 = litT < Infinity ? clamp((time - litT) / 0.8) : 0;
      const outerLit = doneT < Infinity ? clamp((time - doneT - 0.3) / 2) : 0;
      const inner = R * (0.15 + 0.5 * lit0 + 0.6 * outerLit) * flick;
      const outer = R * (0.6 + 1.3 * lit0 + 1.2 * outerLit) * flick;
      const dark = ctx.createRadialGradient(cx, cy, inner, cx, cy, Math.max(inner + 1, outer));
      dark.addColorStop(0, "rgba(4,1,2,0)");
      dark.addColorStop(1, `rgba(4,1,2,${0.9 - 0.25 * outerLit})`);
      ctx.fillStyle = dark;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      stamp(ctx, glow("#ff8a2a", 0.3), cx, cy, R * 2.4 * flick * (0.3 + lit0), 0.16);
      ctx.globalCompositeOperation = "source-over";

      // The ring of diyas.
      const ds = 16 * diyaScale();
      // An ellipse when the screen is narrow, so the side diyas stay on it.
      const rx = Math.max(R * 1.13, Math.min(R * 1.2, w / 2 - ds * 1.4));
      const ry = R * 1.2;
      for (const d of outerDiyas) {
        const x = cx + Math.cos(d.a) * rx;
        const y = cy + Math.sin(d.a) * ry;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
        const k = clamp((time - d.litAt) / 0.5);
        if (doneT === Infinity && k <= 0) continue;
        drawTopDiya(x, y, k, ds, d.a * 10, k > 0);
        if (k > 0) {
          ctx.globalCompositeOperation = "lighter";
          stamp(ctx, glow("#ff8a2a", 0.3), x, y, 160 * diyaScale() * k, 0.18);
          ctx.globalCompositeOperation = "source-over";
        }
      }

      // The centre diya.
      const cs = 24 * diyaScale();
      const ck = litT < Infinity ? clamp((time - litT) / 0.5) : 0;
      drawTopDiya(cx, cy, ck, cs, 1.3, ck > 0);
      if (litT === Infinity) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 3);
        ctx.strokeStyle = `rgba(255,210,140,${0.2 + 0.3 * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, cs * 2 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Embers rising off the flame once everything is lit.
      if (doneT < Infinity) {
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 14; i++) {
          const life = ((t * 0.35 + i / 14) % 1);
          const ex = cx + Math.sin(i * 12.9 + t * 0.8) * R * 0.25 * life;
          const ey = cy - cs * 2 - life * R * 0.9;
          stamp(ctx, glow("#ffb347"), ex, ey, 7, (1 - life) * 0.8);
        }
        ctx.globalCompositeOperation = "source-over";
      }
    },

    destroy() {
      io.sound.setHiss(0);
    },
  };
};
