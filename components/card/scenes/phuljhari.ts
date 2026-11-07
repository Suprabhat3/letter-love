// Scene 2 — Phuljhari.
//
// Pitch dark. The recipient is holding a sparkler. Wherever they wave it, it
// leaves a long-exposure streak — and where it passes over the hidden
// "Shubh Deepavali / <their name>", those letters catch and stay lit. Once
// most of it is written, the rest ignites on its own, and the city below
// switches on.

import {
  clamp,
  damp,
  drawSkyline,
  drawStars,
  ensureFont,
  fitText,
  fonts,
  glow,
  hashString,
  makeSkyline,
  makeStars,
  mulberry32,
  offscreen,
  sampleDrawing,
  stamp,
  type SceneFactory,
  type Skyline,
  type Star,
} from "./engine";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  gen: number;
  branched: boolean;
}

interface Glyph {
  x: number;
  y: number;
  lit: boolean;
  phase: number;
}

const CELL = 20;
const DONE_AT = 0.6;
const TRAIL_S = 1.1;

export const createPhuljhari: SceneFactory = (stage, io) => {
  const { ctx } = stage;
  const rand = mulberry32(hashString(`${io.seed}:phuljhari`));
  const F = fonts();

  let w = 0;
  let h = 0;
  let dpr = 1;
  let sky: HTMLCanvasElement;
  let stars: Star[] = [];
  let skyline: Skyline;
  /**
   * The long-exposure streak, as timestamped segments redrawn each frame.
   * Fading a persistent canvas with destination-out never reaches zero in
   * 8-bit alpha, and the residue built up into a grey haze over the sky.
   */
  const trail: { ax: number; ay: number; bx: number; by: number; t: number }[] = [];
  let lit: ReturnType<typeof offscreen>;
  let ghost: ReturnType<typeof offscreen>;

  let glyphs: Glyph[] = [];
  let grid = new Map<number, number[]>();
  let gap = 4;
  let litCount = 0;

  const sparks: Spark[] = [];
  let tip = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };
  let prevTip = { x: 0, y: 0 };
  let speed = 0;
  let held = false;
  let interacted = false;
  let time = 0;

  let doneT = Infinity;
  let ignition: number[] = [];
  let ignited = 0;
  let finaleSent = false;
  let hintStage = 0;
  // When a letter last caught, and whether the "stuck" tip has been shown since.
  let lastLit = 0;
  let stuckTipped = false;

  const key = (cx: number, cy: number) => cx * 100003 + cy;

  async function buildText() {
    const nameFont = (px: number) => `700 ${px}px ${F.script}`;
    const subFont = (px: number) => `italic 600 ${px}px ${F.serif}`;
    await Promise.all([ensureFont(nameFont(80)), ensureFont(subFont(30))]);
    const probe = offscreen(4, 4).ctx;
    const name = io.to.trim() || "You";
    const nPx = fitText(probe, name, nameFont, w * 0.86, Math.min(h * 0.19, 150), 30);
    const sPx = fitText(probe, "Shubh Deepavali", subFont, w * 0.8, Math.min(h * 0.065, 46), 18);
    const yName = h * 0.44;
    const ySub = yName - nPx * 0.78 - sPx * 0.2;
    gap = clamp(nPx / 22, 3, 5);

    // Each line sampled at a density its own size can carry: the small serif
    // line on the name's grid came out as an unreadable dot pattern.
    const line = (text: string, font: string, y: number) => (c: CanvasRenderingContext2D) => {
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "#fff";
      c.font = font;
      c.fillText(text, w / 2, y);
    };
    const pts = [
      ...sampleDrawing(w, h, clamp(sPx / 12, 2, 3.5), line("Shubh Deepavali", subFont(sPx), ySub), 900),
      ...sampleDrawing(w, h, gap, line(name, nameFont(nPx), yName), 1800),
    ];

    const wasDone = doneT < Infinity;
    glyphs = pts.map((p) => ({ x: p.x, y: p.y, lit: wasDone, phase: rand() * 6.28 }));
    grid = new Map();
    glyphs.forEach((g, i) => {
      const k = key(Math.floor(g.x / CELL), Math.floor(g.y / CELL));
      const cell = grid.get(k);
      if (cell) cell.push(i);
      else grid.set(k, [i]);
    });
    litCount = wasDone ? glyphs.length : 0;

    ghost.ctx.clearRect(0, 0, w, h);
    ghost.ctx.fillStyle = "rgba(255,220,174,0.13)";
    for (const g of glyphs) ghost.ctx.fillRect(g.x - 0.6, g.y - 0.6, 1.2, 1.2);

    lit.ctx.clearRect(0, 0, w, h);
    if (wasDone) for (const g of glyphs) paintGlyph(g);
  }

  function layout() {
    w = stage.w;
    h = stage.h;
    dpr = Math.min(2, stage.dpr);
    const c = offscreen(w, h);
    const g = c.ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#010006");
    g.addColorStop(0.7, "#070414");
    g.addColorStop(1, "#140818");
    c.ctx.fillStyle = g;
    c.ctx.fillRect(0, 0, w, h);
    sky = c.canvas;
    stars = makeStars(mulberry32(hashString(`${io.seed}:pstars`)), w, h * 0.75, Math.round((w * h) / 4200));
    skyline = makeSkyline(mulberry32(hashString(`${io.seed}:pcity`)), w, h + 2, h * 0.16, "#030107");
    lit = offscreen(w, h, dpr);
    ghost = offscreen(w, h, 1);
    if (!interacted) {
      tip = { x: w * 0.5, y: h * 0.76 };
      target = { ...tip };
      prevTip = { ...tip };
    }
    void buildText();
  }

  layout();
  io.hint("Move across the dark sky — a hidden message is waiting");

  function paintGlyph(g: Glyph) {
    const c = lit.ctx;
    c.globalCompositeOperation = "lighter";
    stamp(c, glow("#ffb347", 0.25), g.x, g.y, gap * 4.2, 0.4);
    c.fillStyle = "#ffe9b8";
    c.fillRect(g.x - 1.1, g.y - 1.1, 2.2, 2.2);
    c.globalCompositeOperation = "source-over";
  }

  function light(i: number, burstSparks: boolean) {
    const g = glyphs[i];
    if (g.lit) return;
    g.lit = true;
    litCount++;
    lastLit = time;
    stuckTipped = false;
    paintGlyph(g);
    if (burstSparks && rand() < 0.35) {
      const a = rand() * Math.PI * 2;
      sparks.push({ x: g.x, y: g.y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, life: 0.15, max: 0.15, gen: 1, branched: true });
    }
  }

  /** Light every glyph within reach of the segment the tip just travelled. */
  function sweep(ax: number, ay: number, bx: number, by: number) {
    const R = Math.max(16, gap * 4.2);
    const len = Math.hypot(bx - ax, by - ay);
    const steps = Math.max(1, Math.ceil(len / 6));
    for (let s = 0; s <= steps; s++) {
      const x = ax + ((bx - ax) * s) / steps;
      const y = ay + ((by - ay) * s) / steps;
      const c0 = Math.floor((x - R) / CELL);
      const c1 = Math.floor((x + R) / CELL);
      const r0 = Math.floor((y - R) / CELL);
      const r1 = Math.floor((y + R) / CELL);
      for (let cx = c0; cx <= c1; cx++) {
        for (let cy = r0; cy <= r1; cy++) {
          const cell = grid.get(key(cx, cy));
          if (!cell) continue;
          for (const i of cell) {
            const g = glyphs[i];
            if (!g.lit && (g.x - x) ** 2 + (g.y - y) ** 2 < R * R) light(i, true);
          }
        }
      }
    }
  }

  function complete() {
    doneT = time;
    // Ignite the rest outward from wherever the sparkler is.
    ignition = glyphs
      .map((g, i) => ({ i, d: Math.hypot(g.x - tip.x, g.y - tip.y), lit: g.lit }))
      .filter((g) => !g.lit)
      .sort((a, b) => a.d - b.d)
      .map((g) => g.i);
    io.sound.crackle(40, 1.4, 0.2);
    io.sound.bell(783.99, 0.14, 0.2);
    io.sound.chime();
    io.hint("");
  }

  function aim(x: number, y: number, touch: boolean) {
    target = { x, y: touch ? y - 44 : y };
  }

  return {
    resize() {
      layout();
    },

    down(x, y, e) {
      interacted = true;
      held = true;
      aim(x, y, e.pointerType !== "mouse");
      if (e.pointerType !== "mouse") {
        // Jump straight to the finger rather than streaking across the screen.
        tip = { ...target };
        prevTip = { ...target };
      }
    },

    move(x, y, e, pressed) {
      // A mouse needs no press: the sparkler simply follows the pointer.
      if (e.pointerType === "mouse" || pressed) {
        interacted = true;
        aim(x, y, e.pointerType !== "mouse");
      }
    },

    up() {
      held = false;
    },

    key() {
      interacted = true;
      // Keyboard path: auto-write the next stretch of letters.
      const next = glyphs.findIndex((g) => !g.lit);
      if (next >= 0) target = { x: glyphs[next].x, y: glyphs[next].y };
    },

    frame(dt, t) {
      time = t;

      // --- the tip --------------------------------------------------------
      if (!interacted) {
        target = { x: w * 0.5 + Math.sin(t * 0.9) * w * 0.06, y: h * 0.76 + Math.sin(t * 1.7) * 10 };
      }
      const follow = 1 - damp(0.55, dt);
      prevTip = { ...tip };
      tip.x += (target.x - tip.x) * follow;
      tip.y += (target.y - tip.y) * follow;
      const moved = Math.hypot(tip.x - prevTip.x, tip.y - prevTip.y);
      speed = speed * damp(0.85, dt) + (moved / Math.max(dt, 1e-3)) * (1 - damp(0.85, dt));
      if (interacted && doneT === Infinity) sweep(prevTip.x, prevTip.y, tip.x, tip.y);

      if (glyphs.length && doneT === Infinity && litCount / glyphs.length >= DONE_AT) complete();
      if (doneT < Infinity && ignited < ignition.length) {
        const upto = Math.floor(clamp((time - doneT) / 1.4) * ignition.length);
        for (; ignited < upto; ignited++) light(ignition[ignited], true);
      }
      if (doneT < Infinity && !finaleSent && time - doneT > 2.2) {
        finaleSent = true;
        io.finale();
        io.hint("The sparkler is still yours — keep writing in the sky");
      }

      const progress = glyphs.length ? litCount / glyphs.length : 0;
      // Progress hints, keyed to the fraction of the reveal that completes it.
      const toDone = progress / DONE_AT;
      if (doneT === Infinity) {
        if (hintStage === 0 && toDone > 0.12) {
          hintStage = 1;
          io.hint("Keep going — follow the faint dotted letters");
        } else if (hintStage === 1 && toDone > 0.45) {
          hintStage = 2;
          io.hint("Halfway there — sweep over every word");
        } else if (hintStage === 2 && toDone > 0.8) {
          hintStage = 3;
          io.hint("Almost there…");
        }
        if (interacted && !stuckTipped && time - Math.max(lastLit, 1) > 6) {
          stuckTipped = true;
          io.hint("Tip: sweep the sparkler over the faint dots in the sky");
        }
      }

      // --- sound ----------------------------------------------------------
      io.sound.setHiss(0.18 + clamp(speed / 1600) * 0.5, 5200 + clamp(speed / 1500) * 2500);
      if (rand() < dt * (5 + speed * 0.012)) io.sound.crackle(2, 0.06, 0.1);

      // --- sparks ---------------------------------------------------------
      const rate = 200 + clamp(speed, 0, 1500) * 0.25 + (held ? 60 : 0);
      let emit = rate * dt;
      while (emit > 0) {
        if (emit < 1 && rand() > emit) break;
        emit -= 1;
        const a = rand() * Math.PI * 2;
        const sp = 60 + rand() * rand() * 440;
        const life = 0.08 + rand() * 0.36;
        sparks.push({ x: tip.x, y: tip.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, gen: 0, branched: false });
      }
      const n = sparks.length;
      for (let i = 0; i < n; i++) {
        const p = sparks[i];
        p.life -= dt;
        p.vy += 260 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Real sparkler sparks fork mid-flight — that is the whole look.
        if (!p.branched && p.gen === 0 && p.life < p.max * 0.55 && rand() < 0.35) {
          p.branched = true;
          const kids = 2 + Math.floor(rand() * 3);
          for (let k = 0; k < kids; k++) {
            const a = rand() * Math.PI * 2;
            const sp = 50 + rand() * 120;
            const life = 0.06 + rand() * 0.12;
            sparks.push({ x: p.x, y: p.y, vx: p.vx * 0.3 + Math.cos(a) * sp, vy: p.vy * 0.3 + Math.sin(a) * sp, life, max: life, gen: 1, branched: true });
          }
        }
      }
      let m = 0;
      for (let i = 0; i < sparks.length; i++) if (sparks[i].life > 0) sparks[m++] = sparks[i];
      sparks.length = Math.min(m, 2400);

      // --- draw -----------------------------------------------------------
      ctx.drawImage(sky, 0, 0, w, h);
      drawStars(ctx, stars, t, 0.6);
      const city = doneT < Infinity ? clamp((time - doneT - 0.6) / 2) * 1.15 : 0;
      drawSkyline(ctx, skyline, w, h + 2, city, t, 0.85);

      // The long exposure. Only once someone is holding it — the idle bob
      // should not scrawl across the dark.
      if (interacted && moved > 0.4) trail.push({ ax: prevTip.x, ay: prevTip.y, bx: tip.x, by: tip.y, t: time });
      while (trail.length && time - trail[0].t > TRAIL_S) trail.shift();

      ctx.drawImage(ghost.canvas, 0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (const seg of trail) {
        const a = 1 - (time - seg.t) / TRAIL_S;
        ctx.beginPath();
        ctx.moveTo(seg.ax, seg.ay);
        ctx.lineTo(seg.bx, seg.by);
        ctx.strokeStyle = `rgba(255,150,50,${0.16 * a})`;
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,226,170,${0.85 * a * a})`;
        ctx.lineWidth = 2.6;
        ctx.stroke();
      }
      ctx.drawImage(lit.canvas, 0, 0, w, h);

      // Shimmer across the lit letters; after completion, a slow shine sweeps them.
      if (litCount > 0) {
        const tw = glow("#fff6dc");
        const sweepX = doneT < Infinity ? (((time - doneT) * w * 0.55) % (w * 1.8)) - w * 0.4 : -9999;
        for (let i = 0; i < glyphs.length; i++) {
          const g = glyphs[i];
          if (!g.lit) continue;
          const near = Math.abs(g.x - sweepX) < 26;
          if (near) stamp(ctx, tw, g.x, g.y, gap * 3.4, 0.55);
          else if (((i * 7919 + Math.floor(t * 9)) % 37) === 0) stamp(ctx, tw, g.x, g.y, gap * 2.6, 0.5 + 0.5 * Math.sin(t * 7 + g.phase));
        }
      }

      // Sparks, batched into three strokes by temperature.
      const temps = ["#fffbe8", "#ffd27a", "#ff8a3d"];
      ctx.lineWidth = 1.15;
      for (let band = 0; band < 3; band++) {
        ctx.strokeStyle = temps[band];
        ctx.beginPath();
        for (const p of sparks) {
          const k = p.life / p.max;
          const b = k > 0.62 ? 0 : k > 0.3 ? 1 : 2;
          if (b !== band) continue;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.028, p.y - p.vy * 0.028);
        }
        ctx.stroke();
      }

      // The tip's own light spills over the whole scene.
      stamp(ctx, glow("#ff9a3a", 0.3), tip.x, tip.y, 340, 0.22);
      stamp(ctx, glow("#ffd27a", 0.3), tip.x, tip.y, 70, 0.85);
      stamp(ctx, glow("#ffffff", 0.4), tip.x, tip.y, 22, 1);
      ctx.globalCompositeOperation = "source-over";

      // The wire, angled down to an unseen hand.
      const L = Math.min(190, h * 0.24);
      const ang = 1.05;
      const ex = tip.x + Math.cos(ang) * L;
      const ey = tip.y + Math.sin(ang) * L;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#5d5a57";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(tip.x + Math.cos(ang) * 6, tip.y + Math.sin(ang) * 6);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      // The still-coated part, about to burn.
      ctx.strokeStyle = "#3b3631";
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(tip.x + Math.cos(ang) * 8, tip.y + Math.sin(ang) * 8);
      ctx.lineTo(tip.x + Math.cos(ang) * L * 0.45, tip.y + Math.sin(ang) * L * 0.45);
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(255,110,30,0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(tip.x + Math.cos(ang) * 9, tip.y + Math.sin(ang) * 9);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    },

    destroy() {
      io.sound.setHiss(0);
    },
  };
};
