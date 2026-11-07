// Scene 1 — Diya Chain.
//
// A parapet on Amavasya night: no moon, a dark city, a row of unlit diyas.
// The sender has lit the first one. The recipient carries its flame along the
// row (drag), or taps each diya to send a spark across. Every diya genuinely
// lights the wall around it. When the last one catches, the city switches on
// left to right, rockets go up, and one of them bursts into the recipient's
// name.

import {
  burst,
  clamp,
  damp,
  drawParticles,
  drawSkyline,
  drawStars,
  easeOutCubic,
  ensureFont,
  fitText,
  fonts,
  glow,
  FIREWORK_COLORS,
  hashString,
  lerp,
  makeSkyline,
  makeStars,
  mulberry32,
  offscreen,
  sampleDrawing,
  stamp,
  stepParticles,
  type BurstKind,
  type Particle,
  type SceneFactory,
  type Skyline,
  type Star,
} from "./engine";

interface Diya {
  x: number;
  lit: boolean;
  litAt: number;
  seed: number;
}

interface Rocket {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t0: number;
  dur: number;
  kind: BurstKind | "name";
  color: string;
}

interface Jump {
  from: number;
  to: number;
  t0: number;
}

interface NamePt {
  tx: number;
  ty: number;
  cx: number;
  cy: number;
  delay: number;
  phase: number;
}

type Phase = "lighting" | "city" | "show" | "free";

/** Draws a flame whose base sits on (x, y). `k` scales it; 0 draws nothing. */
export function drawFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  k: number,
  t: number,
  seed: number,
  withGlow = true,
) {
  if (k <= 0.01) return;
  const H = size * k * (1 + 0.09 * Math.sin(t * 13 + seed) + 0.05 * Math.sin(t * 7.3 + seed * 2.1));
  const W = size * 0.3 * k;
  const sway = (Math.sin(t * 2.7 + seed) * 0.6 + Math.sin(t * 9.1 + seed) * 0.25) * size * 0.09 * k;

  ctx.globalCompositeOperation = "lighter";
  if (withGlow) {
    stamp(ctx, glow("#ff7a1a", 0.25), x + sway * 0.5, y - H * 0.4, H * 4.2, 0.5);
    stamp(ctx, glow("#ffd27a", 0.3), x + sway * 0.5, y - H * 0.45, H * 1.8, 0.6);
  }

  const layer = (scale: number, inner: string, outer: string, alpha: number) => {
    const h = H * scale;
    const wd = W * scale;
    const g = ctx.createRadialGradient(x, y - h * 0.25, 0, x, y - h * 0.35, h * 0.8);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - wd * 0.15, y);
    ctx.bezierCurveTo(x - wd, y - h * 0.2, x - wd * 0.55 + sway * 0.6, y - h * 0.72, x + sway, y - h);
    ctx.bezierCurveTo(x + wd * 0.55 + sway * 0.6, y - h * 0.72, x + wd, y - h * 0.2, x + wd * 0.15, y);
    ctx.closePath();
    ctx.fill();
  };
  layer(1, "rgba(255,190,70,1)", "rgba(255,70,10,0)", 0.95);
  layer(0.62, "rgba(255,250,225,1)", "rgba(255,200,90,0.2)", 1);
  // The blue at the base of a real oil flame.
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#6f8cff";
  ctx.beginPath();
  ctx.ellipse(x, y - H * 0.06, W * 0.38, H * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

export const createDiyaChain: SceneFactory = (stage, io) => {
  const { ctx } = stage;
  const rand = mulberry32(hashString(`${io.seed}:diya`));
  const F = fonts();
  const N = stage.w < 640 ? 5 : 7;

  let w = 0;
  let h = 0;
  let horizon = 0;
  let ledge = 0;
  let wallTop = 0;
  let s = 1;

  let sky: HTMLCanvasElement;
  let skyline: Skyline;
  let stars: Star[] = [];
  let litWall: ReturnType<typeof offscreen>;
  let darkWall: ReturnType<typeof offscreen>;
  let light: ReturnType<typeof offscreen>;
  let fw: ReturnType<typeof offscreen>;

  const diyas: Diya[] = Array.from({ length: N }, (_, i) => ({
    x: 0,
    // The sender's diya catches a beat after the scene appears, so the first
    // thing the recipient sees is a flame being born, not one already there.
    lit: i === 0,
    litAt: i === 0 ? 0.7 : -10,
    seed: rand() * 100,
  }));

  const sparks: Particle[] = [];
  const fwParticles: Particle[] = [];
  const rockets: Rocket[] = [];
  const jumps: Jump[] = [];
  const queue: { at: number; kind: BurstKind | "name" }[] = [];

  let phase: Phase = "lighting";
  let time = 0;
  let cityT0 = Infinity;
  let flash = 0;
  let flashColor = "#ffd27a";
  let nextAuto = Infinity;

  let carry: { x: number; y: number; touch: boolean } | null = null;
  let interacted = false;

  let namePts: NamePt[] = [];
  let nameOrigin = { x: 0, y: 0 };
  let nameT0 = Infinity;
  let nameFontPx = 60;
  let nameCenterY = 0;
  let finaleSent = false;

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------

  const wickX = (d: Diya) => d.x + 40 * s;
  const wickY = () => ledge - 25 * s;

  function buildSky() {
    const c = offscreen(w, h);
    const g = c.ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#04030c");
    g.addColorStop(0.42, "#0d0820");
    g.addColorStop(horizon / h, "#2a1030");
    g.addColorStop(Math.min(1, ledge / h + 0.01), "#3a1424");
    g.addColorStop(1, "#000");
    c.ctx.fillStyle = g;
    c.ctx.fillRect(0, 0, w, h);
    sky = c.canvas;
  }

  function buildWall() {
    const H = h - wallTop;
    litWall = offscreen(w, H, Math.min(2, window.devicePixelRatio || 1));
    const c = litWall.ctx;
    const y0 = ledge - wallTop;

    // Plaster face.
    const face = c.createLinearGradient(0, y0, 0, H);
    face.addColorStop(0, "#b4693e");
    face.addColorStop(1, "#5a2c18");
    c.fillStyle = face;
    c.fillRect(0, y0, w, H - y0);
    const r2 = mulberry32(hashString(`${io.seed}:wall`));
    for (let i = 0; i < (w * H) / 90; i++) {
      c.fillStyle = r2() < 0.5 ? "rgba(0,0,0,0.10)" : "rgba(255,225,190,0.07)";
      const sz = 0.6 + r2() * 1.6;
      c.fillRect(r2() * w, y0 + r2() * (H - y0), sz, sz);
    }

    // Sindoor-red band with a white kolam zigzag.
    const bandY = y0 + 62 * s;
    const bandH = 24 * s;
    c.fillStyle = "#8c1d18";
    c.fillRect(0, bandY, w, bandH);
    c.strokeStyle = "#fff4e0";
    c.lineWidth = Math.max(1, 1.6 * s);
    c.beginPath();
    const step = 14 * s;
    for (let x = 0; x <= w + step; x += step) {
      const yy = bandY + (Math.round(x / step) % 2 ? bandH * 0.22 : bandH * 0.78);
      if (x === 0) c.moveTo(x, yy);
      else c.lineTo(x, yy);
    }
    c.stroke();
    c.fillStyle = "#fff4e0";
    for (let x = step / 2; x < w; x += step) {
      c.beginPath();
      c.arc(x, bandY - 6 * s, 1.6 * s, 0, Math.PI * 2);
      c.arc(x, bandY + bandH + 6 * s, 1.6 * s, 0, Math.PI * 2);
      c.fill();
    }

    // Marigold toran between the diyas.
    const anchors = [-30, ...diyas.map((d) => d.x), w + 30];
    const gy = y0 + 16 * s;
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i];
      const b = anchors[i + 1];
      const sag = 30 * s;
      const n = Math.max(4, Math.floor((b - a) / (8.5 * s)));
      for (let j = 0; j <= n; j++) {
        const u = j / n;
        const x = lerp(a, b, u);
        const y = gy + sag * 4 * u * (1 - u);
        const r = 5.4 * s;
        c.fillStyle = j % 2 ? "#ff9f1c" : "#ffbf1f";
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "rgba(200,70,0,0.55)";
        c.beginPath();
        c.arc(x + r * 0.15, y + r * 0.1, r * 0.45, 0, Math.PI * 2);
        c.fill();
      }
      // Mango leaves at each anchor.
      for (let k = -1; k <= 1; k++) {
        c.save();
        c.translate(b, gy + 4 * s);
        c.rotate(k * 0.45);
        c.fillStyle = k === 0 ? "#2f7d32" : "#3e9a3c";
        c.beginPath();
        c.ellipse(0, 14 * s, 4.5 * s, 13 * s, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    // The ledge lip the diyas sit on.
    const lip = c.createLinearGradient(0, y0 - 4 * s, 0, y0 + 10 * s);
    lip.addColorStop(0, "#d99a68");
    lip.addColorStop(1, "#7d4426");
    c.fillStyle = lip;
    c.fillRect(0, y0 - 4 * s, w, 14 * s);
    c.fillStyle = "rgba(255,235,205,0.55)";
    c.fillRect(0, y0 - 4 * s, w, 1);
    const shade = c.createLinearGradient(0, y0 + 10 * s, 0, y0 + 26 * s);
    shade.addColorStop(0, "rgba(0,0,0,0.45)");
    shade.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = shade;
    c.fillRect(0, y0 + 10 * s, w, 16 * s);

    darkWall = offscreen(w, H, Math.min(2, window.devicePixelRatio || 1));
    darkWall.ctx.drawImage(litWall.canvas, 0, 0, w, H);
    darkWall.ctx.globalCompositeOperation = "source-atop";
    darkWall.ctx.fillStyle = "rgba(9,4,12,0.9)";
    darkWall.ctx.fillRect(0, 0, w, H);

    light = offscreen(w, H, 1);
  }

  async function buildName() {
    const font = (px: number) => `700 ${px}px ${F.script}`;
    await ensureFont(font(80));
    const probe = offscreen(4, 4).ctx;
    const name = io.to.trim() || "You";
    nameFontPx = fitText(probe, name, font, w * 0.86, Math.min(h * 0.16, 132), 28);
    nameCenterY = Math.max(nameFontPx * 0.8, horizon * 0.42);
    const gap = clamp(nameFontPx / 26, 2.5, 4.5);
    const pts = sampleDrawing(
      w,
      h,
      gap,
      (c) => {
        c.font = font(nameFontPx);
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#fff";
        c.fillText(name, w / 2, nameCenterY);
      },
      2400,
    );
    const formed = nameT0 < Infinity;
    namePts = pts.map((p) => {
      const a = rand() * Math.PI * 2;
      const r = 60 + rand() * 160;
      return {
        tx: p.x,
        ty: p.y,
        cx: w / 2 + Math.cos(a) * r * 2.2,
        cy: nameCenterY + Math.sin(a) * r,
        delay: formed ? 0 : rand() * 0.25,
        phase: rand() * Math.PI * 2,
      };
    });
    nameOrigin = { x: w / 2, y: nameCenterY };
  }

  function layout() {
    w = stage.w;
    h = stage.h;
    horizon = h * 0.5;
    ledge = h * 0.72;
    wallTop = ledge - 12;
    const margin = w * (N === 5 ? 0.11 : 0.12);
    const spacing = (w - margin * 2) / (N - 1);
    s = clamp(Math.min(spacing / 100, h / 720), 0.5, 1.15);
    diyas.forEach((d, i) => (d.x = margin + i * spacing - 8 * s));

    buildSky();
    stars = makeStars(mulberry32(hashString(`${io.seed}:stars`)), w, horizon, Math.round((w * horizon) / 2200));
    skyline = makeSkyline(mulberry32(hashString(`${io.seed}:city`)), w, ledge + 2, (ledge - horizon) * 0.95);
    buildWall();
    fw = offscreen(w, h, 0.5);
    void buildName();
  }

  layout();
  io.hint("Drag the flame from diya to diya — or tap each one");

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  function ignite(i: number) {
    const d = diyas[i];
    if (d.lit) return;
    d.lit = true;
    d.litAt = time;
    io.sound.ignite();
    const x = wickX(d);
    const y = wickY();
    for (let k = 0; k < 34; k++) {
      const a = -Math.PI / 2 + (rand() - 0.5) * 2.2;
      const sp = 80 + rand() * 260;
      sparks.push({
        x,
        y: y - 8 * s,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.4 + rand() * 0.6,
        max: 1,
        color: rand() < 0.6 ? "#ffd27a" : "#ff8a3d",
        size: 1.3,
        drag: 0.94,
        gravity: 420,
        streak: true,
      });
    }
    if (diyas.every((dd) => dd.lit)) {
      phase = "city";
      cityT0 = time + 0.6;
      io.hint("");
    }
  }

  function nearestLit(i: number) {
    let best = -1;
    let dist = Infinity;
    diyas.forEach((d, j) => {
      if (d.lit && Math.abs(j - i) < dist) {
        dist = Math.abs(j - i);
        best = j;
      }
    });
    return best;
  }

  function sendJump(to: number) {
    if (diyas[to].lit || jumps.some((j) => j.to === to)) return;
    const from = nearestLit(to);
    if (from < 0) return;
    jumps.push({ from, to, t0: time });
  }

  function launch(kind: BurstKind | "name", x1?: number, y1?: number) {
    const x0 = kind === "name" ? w / 2 : w * (0.15 + rand() * 0.7);
    rockets.push({
      x0,
      y0: ledge,
      x1: kind === "name" ? w / 2 : (x1 ?? x0 + (rand() - 0.5) * 80),
      y1: kind === "name" ? nameCenterY : (y1 ?? h * (0.1 + rand() * 0.24)),
      t0: time,
      dur: kind === "name" ? 1.25 : 0.9 + rand() * 0.35,
      kind,
      color: FIREWORK_COLORS[Math.floor(rand() * FIREWORK_COLORS.length)],
    });
    io.sound.launch();
  }

  function explode(r: Rocket) {
    const scale = clamp(Math.min(w, h) / 700, 0.55, 1.2);
    flash = 1;
    flashColor = r.color;
    if (r.kind === "name") {
      burst(fwParticles, r.x1, r.y1, "peony", "#ffd27a", scale * 1.15, rand);
      nameT0 = time;
      io.sound.boom(1.25);
      io.sound.bell(659.25, 0.12, 0.9);
      return;
    }
    burst(fwParticles, r.x1, r.y1, r.kind, r.color, scale, rand);
    io.sound.boom(r.kind === "willow" ? 0.7 : 0.9);
  }

  // -------------------------------------------------------------------------
  // Loop
  // -------------------------------------------------------------------------

  return {
    resize() {
      layout();
    },

    down(x, y, e) {
      interacted = true;
      if (phase === "lighting") {
        const touch = e.pointerType !== "mouse";
        const hitR = Math.max(42, 50 * s);
        const hit = diyas.findIndex((d) => Math.hypot(x - (d.x + 10 * s), y - (ledge - 20 * s)) < hitR);
        if (hit >= 0 && diyas[hit].lit) {
          carry = { x, y: touch ? y - 34 : y, touch };
        } else if (hit >= 0) {
          sendJump(hit);
        } else if (diyas.some((d) => d.lit)) {
          // A press anywhere else still picks up a flame, so nobody has to
          // aim at a 50px target on a phone.
          carry = { x, y: touch ? y - 34 : y, touch };
        }
        return;
      }
      if ((phase === "free" || phase === "show") && y < ledge - 20) {
        if (rockets.length < 5) {
          const kinds: BurstKind[] = ["peony", "ring", "willow", "chrysanthemum"];
          launch(kinds[Math.floor(rand() * kinds.length)], x, Math.max(h * 0.08, y));
        }
      }
    },

    move(x, y, _e, pressed) {
      if (!carry || !pressed) return;
      const ny = carry.touch ? y - 34 : y;
      // Trail sparks along the path the flame is carried.
      if (rand() < 0.7) {
        sparks.push({
          x,
          y: ny,
          vx: (rand() - 0.5) * 50,
          vy: -30 - rand() * 60,
          life: 0.3 + rand() * 0.4,
          max: 0.7,
          color: "#ffb347",
          size: 1.6,
          drag: 0.95,
          gravity: -20,
        });
      }
      carry.x = x;
      carry.y = ny;
      const reach = Math.max(34, 40 * s);
      diyas.forEach((d, i) => {
        if (!d.lit && Math.hypot(carry!.x - wickX(d), carry!.y - wickY()) < reach) ignite(i);
      });
    },

    up() {
      carry = null;
    },

    key() {
      interacted = true;
      if (phase === "lighting") {
        const next = diyas.findIndex((d) => !d.lit);
        if (next >= 0) sendJump(next);
      } else if (rockets.length < 5) {
        launch("peony");
      }
    },

    frame(dt, t) {
      time = t;

      // --- update -------------------------------------------------------
      for (let i = jumps.length - 1; i >= 0; i--) {
        if (time - jumps[i].t0 >= 0.5) {
          ignite(jumps[i].to);
          jumps.splice(i, 1);
        }
      }

      if (phase === "city" && time >= cityT0) {
        if (!queue.length && !rockets.length && nameT0 === Infinity) {
          io.sound.chime();
          const base = time + 1.9;
          queue.push(
            { at: base, kind: "peony" },
            { at: base + 0.5, kind: "ring" },
            { at: base + 1.1, kind: "willow" },
            { at: base + 1.5, kind: "chrysanthemum" },
            { at: base + 2.6, kind: "name" },
          );
          phase = "show";
        }
      }
      for (let i = queue.length - 1; i >= 0; i--) {
        if (time >= queue[i].at) {
          launch(queue[i].kind);
          queue.splice(i, 1);
        }
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        const k = (time - r.t0) / r.dur;
        if (k >= 1) {
          explode(r);
          rockets.splice(i, 1);
          continue;
        }
        const e = easeOutCubic(k);
        const x = lerp(r.x0, r.x1, e) + Math.sin(k * 9) * 2;
        const y = lerp(r.y0, r.y1, e);
        fwParticles.push({
          x,
          y,
          vx: (rand() - 0.5) * 20,
          vy: 30 + rand() * 30,
          life: 0.45,
          max: 0.45,
          color: "#ffcf8a",
          size: 1.6,
          drag: 0.9,
          gravity: 30,
          twinkle: true,
        });
      }

      if (nameT0 < Infinity && !finaleSent && time - nameT0 > 2.1) {
        finaleSent = true;
        phase = "free";
        nextAuto = time + 2.5;
        io.finale();
        io.hint("Tap the sky for more");
      }
      if (phase === "free" && time >= nextAuto) {
        nextAuto = time + 2.4 + rand() * 1.6;
        if (rockets.length < 3) {
          const kinds: BurstKind[] = ["peony", "ring", "willow", "chrysanthemum"];
          launch(kinds[Math.floor(rand() * kinds.length)]);
        }
      }

      stepParticles(sparks, dt);
      stepParticles(fwParticles, dt);
      if (fwParticles.length > 2600) fwParticles.splice(0, fwParticles.length - 2600);
      flash *= damp(0.88, dt);

      const city = phase === "lighting" ? 0 : clamp((time - cityT0) / 2.2) * 1.15;

      // --- draw: sky ----------------------------------------------------
      ctx.drawImage(sky, 0, 0, w, h);
      drawStars(ctx, stars, t, 1 - clamp(city) * 0.35);

      if (city > 0) {
        ctx.globalCompositeOperation = "lighter";
        const hg = ctx.createLinearGradient(0, horizon - 120, 0, ledge);
        hg.addColorStop(0, "rgba(255,120,40,0)");
        hg.addColorStop(1, `rgba(255,120,40,${0.22 * clamp(city)})`);
        ctx.fillStyle = hg;
        ctx.fillRect(0, horizon - 120, w, ledge - horizon + 120);
        ctx.globalCompositeOperation = "source-over";
      }

      // Fireworks on a half-res persistence layer: the trails are free.
      fw.ctx.globalCompositeOperation = "destination-out";
      fw.ctx.fillStyle = `rgba(0,0,0,${1 - damp(0.84, dt)})`;
      fw.ctx.fillRect(0, 0, w, h);
      drawParticles(fw.ctx, fwParticles, 4);
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(fw.canvas, 0, 0, w, h);
      if (flash > 0.02) {
        // Deliberately faint: a full-screen white flash is a photosensitivity
        // problem, and the sky glow sells it without one.
        ctx.globalAlpha = flash * 0.07;
        ctx.fillStyle = flashColor;
        ctx.fillRect(0, 0, w, ledge);
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = "source-over";

      // Rocket heads.
      ctx.globalCompositeOperation = "lighter";
      for (const r of rockets) {
        const e = easeOutCubic((time - r.t0) / r.dur);
        const x = lerp(r.x0, r.x1, e);
        const y = lerp(r.y0, r.y1, e);
        stamp(ctx, glow("#fff1c9"), x, y, 16, 0.9);
      }
      ctx.globalCompositeOperation = "source-over";

      // --- draw: the name -----------------------------------------------
      if (nameT0 < Infinity && namePts.length) {
        const age = time - nameT0;
        ctx.globalCompositeOperation = "lighter";
        const gold = glow("#ffcf6e");
        for (let i = 0; i < namePts.length; i++) {
          const p = namePts[i];
          const k = easeOutCubic((age - p.delay) / 1.25);
          if (k <= 0) continue;
          // Quadratic bezier: burst origin → a random overshoot → the letter.
          const u = 1 - k;
          const x = u * u * nameOrigin.x + 2 * u * k * p.cx + k * k * p.tx;
          const y = u * u * nameOrigin.y + 2 * u * k * p.cy + k * k * p.ty;
          const tw = 0.7 + 0.3 * Math.sin(t * 5 + p.phase);
          ctx.globalAlpha = tw;
          ctx.fillStyle = k < 1 ? "#ffe2a0" : "#fff6dc";
          ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
          stamp(ctx, gold, x, y, 12, 0.3 * tw);
        }
        // Once the sparks have landed, a soft fill behind them so the name
        // reads at a glance rather than as a dot-matrix puzzle.
        const fill = clamp((age - 1.1) / 0.8);
        if (fill > 0) {
          ctx.globalAlpha = fill * 0.4;
          ctx.font = `700 ${nameFontPx}px ${F.script}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffc861";
          ctx.shadowColor = "rgba(255,170,50,1)";
          ctx.shadowBlur = 24;
          ctx.fillText(io.to.trim() || "You", w / 2, nameCenterY);
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        // Willow drips off the letters, so the name never sits dead still.
        if (age > 1.4 && rand() < 0.5) {
          const p = namePts[Math.floor(rand() * namePts.length)];
          fwParticles.push({
            x: p.tx,
            y: p.ty,
            vx: (rand() - 0.5) * 10,
            vy: 10,
            life: 1.2,
            max: 1.2,
            color: "#ffcf6e",
            size: 1.4,
            drag: 0.97,
            gravity: 40,
            twinkle: true,
          });
        }

        const sub = clamp((age - 1.3) / 1);
        if (sub > 0) {
          ctx.globalAlpha = sub;
          ctx.font = `italic ${Math.round(clamp(nameFontPx * 0.26, 14, 28))}px ${F.serif}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffe7b8";
          ctx.shadowColor = "rgba(255,170,60,0.9)";
          ctx.shadowBlur = 14;
          ctx.fillText("Shubh Deepavali", w / 2, nameCenterY + nameFontPx * 0.78);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }

      // --- draw: city ---------------------------------------------------
      drawSkyline(ctx, skyline, w, ledge + 2, city, t);

      // --- draw: the wall, lit only where the light reaches -------------
      const H = h - wallTop;
      ctx.drawImage(darkWall.canvas, 0, wallTop, w, H);

      const lc = light.ctx;
      lc.globalCompositeOperation = "source-over";
      lc.clearRect(0, 0, w, H);
      const white = glow("#ffffff", 0.35);
      const flare = time > cityT0 ? 0.4 * Math.exp(-(time - cityT0) * 2.5) : 0;
      const flameK = (d: Diya) => {
        if (!d.lit) return 0;
        const g = clamp((time - d.litAt) / 0.55);
        return easeOutCubic(g) + 0.3 * Math.sin(g * Math.PI) + flare;
      };
      for (const d of diyas) {
        const k = flameK(d);
        if (k <= 0) continue;
        const R = 330 * s * k * (1 + 0.05 * Math.sin(t * 11 + d.seed));
        stamp(lc, white, wickX(d), wickY() - wallTop, R, 1);
      }
      if (carry) stamp(lc, white, carry.x, carry.y - wallTop, 220 * s, 0.8);
      if (city > 0) {
        lc.fillStyle = `rgba(255,255,255,${0.28 * clamp(city)})`;
        lc.fillRect(0, 0, w, H);
      }
      lc.globalCompositeOperation = "source-in";
      lc.drawImage(litWall.canvas, 0, 0, w, H);
      lc.globalCompositeOperation = "source-over";
      ctx.drawImage(light.canvas, 0, wallTop, w, H);

      // --- draw: diyas --------------------------------------------------
      const next = diyas.findIndex((d) => !d.lit);
      diyas.forEach((d, i) => {
        const k = flameK(d);
        drawDiya(d, k > 0);
        if (phase === "lighting" && i === next) {
          // A slow breathing ring on the one to light next.
          const pulse = 0.5 + 0.5 * Math.sin(t * 3);
          ctx.strokeStyle = `rgba(255,210,140,${0.18 + 0.25 * pulse})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(wickX(d), wickY() - 6 * s, 22 * s + pulse * 8 * s, 0, Math.PI * 2);
          ctx.stroke();
        }
        drawFlame(ctx, wickX(d), wickY(), 34 * s, k, t, d.seed);
      });

      // Warm spill onto everything near a flame.
      ctx.globalCompositeOperation = "lighter";
      for (const d of diyas) {
        const k = flameK(d);
        if (k > 0) stamp(ctx, glow("#ff7a1a", 0.3), wickX(d), wickY(), 260 * s * k, 0.13);
      }
      ctx.globalCompositeOperation = "source-over";

      // Spark jumps (the tap path).
      for (const j of jumps) {
        const k = clamp((time - j.t0) / 0.5);
        const a = diyas[j.from];
        const b = diyas[j.to];
        const x = lerp(wickX(a), wickX(b), k);
        const y = wickY() - 18 * s - Math.sin(k * Math.PI) * 70 * s;
        ctx.globalCompositeOperation = "lighter";
        stamp(ctx, glow("#ffd27a"), x, y, 34 * s + 10, 1);
        ctx.globalCompositeOperation = "source-over";
        sparks.push({
          x,
          y,
          vx: (rand() - 0.5) * 40,
          vy: (rand() - 0.5) * 40,
          life: 0.35,
          max: 0.35,
          color: "#ffb347",
          size: 1.6,
          drag: 0.9,
          gravity: 60,
        });
      }

      if (carry) drawFlame(ctx, carry.x, carry.y, 28 * s + 6, 0.85, t, 7);

      drawParticles(ctx, sparks, 4);

      // The sender's credit on the diya they lit.
      const credit = diyas[1]?.lit ? clamp(1 - (time - diyas[1].litAt) / 0.8) : 1;
      if (credit > 0 && io.from.trim()) {
        ctx.globalAlpha = credit * clamp(t / 1.2);
        ctx.font = `italic ${Math.round(clamp(13 * s + 3, 12, 16))}px ${F.serif}`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffdcae";
        ctx.fillText(`lit by ${io.from.trim()}`, wickX(diyas[0]), wickY() - 70 * s);
        ctx.globalAlpha = 1;
      }

      if (!interacted && t > 4 && phase === "lighting") {
        // Nudge: a ghost flame drifting from the first diya to the second.
        const k = (t % 2.4) / 2.4;
        const a = diyas[0];
        const b = diyas[1];
        ctx.globalAlpha = Math.sin(k * Math.PI) * 0.6;
        drawFlame(ctx, lerp(wickX(a), wickX(b), easeOutCubic(k)), wickY() - 30 * s, 22 * s, 0.7, t, 3, false);
        ctx.globalAlpha = 1;
      }
    },
  };

  // Hoisted: draws a side-on clay diya resting on the ledge.
  function drawDiya(d: Diya, lit: boolean) {
    const x = d.x;
    const y = ledge;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(x + 6 * s, y + 1, 42 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createLinearGradient(0, y - 24 * s, 0, y);
    body.addColorStop(0, lit ? "#d8743a" : "#5a2a18");
    body.addColorStop(1, lit ? "#6e2810" : "#200d07");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(x - 34 * s, y - 20 * s);
    ctx.bezierCurveTo(x - 30 * s, y + 2 * s, x + 18 * s, y + 4 * s, x + 30 * s, y - 14 * s);
    ctx.lineTo(x + 44 * s, y - 24 * s);
    ctx.quadraticCurveTo(x + 18 * s, y - 25 * s, x - 34 * s, y - 20 * s);
    ctx.closePath();
    ctx.fill();

    // Oil and rim.
    ctx.fillStyle = lit ? "#3b1606" : "#140703";
    ctx.beginPath();
    ctx.ellipse(x + 2 * s, y - 21 * s, 31 * s, 4.5 * s, -0.04, 0, Math.PI * 2);
    ctx.fill();
    if (lit) {
      ctx.fillStyle = "rgba(255,200,90,0.5)";
      ctx.beginPath();
      ctx.ellipse(x + 10 * s, y - 21.5 * s, 14 * s, 1.6 * s, -0.04, 0, Math.PI * 2);
      ctx.fill();
    }

    // Painted dots.
    ctx.fillStyle = lit ? "rgba(255,236,170,0.9)" : "rgba(255,236,170,0.12)";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x - 18 * s + i * 9 * s, y - 9 * s + Math.abs(i - 2) * 0.8 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wick.
    ctx.strokeStyle = lit ? "#2a1408" : "#3a2a20";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(x + 36 * s, y - 21 * s);
    ctx.lineTo(wickX(d), wickY());
    ctx.stroke();
  }
};
