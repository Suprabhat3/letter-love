// Scene 4 — Sky Lanterns.
//
// A river ghat on Diwali night: the far bank lit, diyas floating on black
// water, the sky mirrored in it. Every tap releases a paper lantern; each of
// the first few carries a piece of the sender's wish and leaves those words
// behind in the sky. The last, golden one carries the recipient's name — and
// then the whole far bank lets theirs go too.

import {
  clamp,
  drawSkyline,
  drawStars,
  easeOutCubic,
  ensureFont,
  fitText,
  fonts,
  glow,
  hashString,
  lerp,
  makeSkyline,
  makeStars,
  mulberry32,
  offscreen,
  stamp,
  type SceneFactory,
  type Skyline,
  type Star,
} from "./engine";

interface Lantern {
  x: number;
  y: number;
  y0: number;
  vy: number;
  scale: number;
  born: number;
  sway: number;
  gold: boolean;
  /** Foreground lanterns are drawn over the water; distant ones get mirrored. */
  near: boolean;
  phrase: number;
}

interface Words {
  /** Phrase index, or -1 for the name. */
  id: number;
  text: string;
  /** Where it settles in the sky. */
  sx: number;
  sy: number;
  px: number;
  big: boolean;
  /** When it left its lantern; Infinity while still attached. */
  leftAt: number;
  fromX: number;
  fromY: number;
}

const DEFAULT_WISH = "May every diya bring you one good year";

function chunk(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean).slice(0, 18);
  if (!words.length) return [];
  const parts = clamp(Math.ceil(words.length / 4), 1, 3);
  const size = Math.ceil(words.length / parts);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(" "));
  return out;
}

function lanternSprite(gold: boolean) {
  const W = 100;
  const H = 150;
  const { canvas, ctx } = offscreen(W, H, 2);
  const top = 18;
  const bot = 132;
  const wt = 36;
  const wb = 27;
  const g = ctx.createRadialGradient(50, bot - 8, 2, 50, bot - 30, 120);
  if (gold) {
    g.addColorStop(0, "#fffbe6");
    g.addColorStop(0.3, "#ffe08a");
    g.addColorStop(0.75, "#e6a91a");
    g.addColorStop(1, "#8a5a00");
  } else {
    g.addColorStop(0, "#fff4c8");
    g.addColorStop(0.3, "#ffb347");
    g.addColorStop(0.75, "#e8590c");
    g.addColorStop(1, "#8f2500");
  }
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(50 - wt, top + 6);
  ctx.quadraticCurveTo(50 - wt, top, 50 - wt + 8, top);
  ctx.lineTo(50 + wt - 8, top);
  ctx.quadraticCurveTo(50 + wt, top, 50 + wt, top + 6);
  ctx.lineTo(50 + wb, bot);
  ctx.lineTo(50 - wb, bot);
  ctx.closePath();
  ctx.fill();
  // Paper ribs.
  ctx.strokeStyle = gold ? "rgba(120,80,0,0.22)" : "rgba(120,30,0,0.22)";
  ctx.lineWidth = 1;
  for (const k of [-0.5, 0, 0.5]) {
    ctx.beginPath();
    ctx.moveTo(50 + wt * k, top + 2);
    ctx.lineTo(50 + wb * k, bot);
    ctx.stroke();
  }
  // Top cap and bottom rim.
  ctx.fillStyle = gold ? "rgba(110,70,0,0.55)" : "rgba(110,25,0,0.5)";
  ctx.fillRect(50 - wt + 2, top, wt * 2 - 4, 5);
  ctx.fillStyle = "rgba(60,15,0,0.85)";
  ctx.beginPath();
  ctx.ellipse(50, bot, wb, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff3c4";
  ctx.beginPath();
  ctx.ellipse(50, bot - 2, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

export const createLanterns: SceneFactory = (stage, io) => {
  const { ctx, canvas } = stage;
  const rand = mulberry32(hashString(`${io.seed}:lanterns`));
  const F = fonts();

  const phrases = chunk(io.wish?.trim() || DEFAULT_WISH);
  const needed = phrases.length + 1;

  let w = 0;
  let h = 0;
  let horizon = 0;
  let s0 = 1;
  let sky: HTMLCanvasElement;
  let stars: Star[] = [];
  let skyline: Skyline;
  /** Half-res snapshot of the sky, which the river reflects. */
  let mirror: ReturnType<typeof offscreen>;
  const sprite = lanternSprite(false);
  const goldSprite = lanternSprite(true);

  const lanterns: Lantern[] = [];
  const words: Words[] = [];
  let released = 0;
  let time = 0;
  let massT = Infinity;
  let finaleSent = false;
  let bgAccum = 0;

  const floaters = Array.from({ length: 14 }, () => ({ u: rand(), d: rand(), speed: 0.004 + rand() * 0.008, seed: rand() * 10 }));

  let namePx = 48;
  let linePx = 20;

  async function layoutText() {
    const nameFont = (px: number) => `700 ${px}px ${F.script}`;
    const lineFont = (px: number) => `italic ${px}px ${F.serif}`;
    await Promise.all([ensureFont(nameFont(60)), ensureFont(lineFont(24))]);
    const probe = offscreen(2, 2).ctx;
    namePx = fitText(probe, io.to.trim() || "You", nameFont, w * 0.84, Math.min(h * 0.11, 92), 26);
    const longest = phrases.reduce((a, b) => (a.length > b.length ? a : b), "");
    linePx = fitText(probe, longest, lineFont, w * 0.86, Math.min(h * 0.04, 28), 13);
    // Settled words keep their place across a resize.
    for (const wd of words) Object.assign(wd, slot(wd.id));
  }

  function slot(i: number) {
    const nameY = h * 0.1 + namePx * 0.4;
    if (i < 0) return { sx: w / 2, sy: nameY, px: namePx };
    // Clear of the script's descenders (the "y" in Riya hangs a long way).
    return { sx: w / 2, sy: nameY + namePx * 0.98 + linePx * 0.3 + i * linePx * 1.55, px: linePx };
  }

  function layout() {
    w = stage.w;
    h = stage.h;
    horizon = h * 0.64;
    s0 = clamp(Math.min(w, h) / 760, 0.55, 1.05);
    const c = offscreen(w, h);
    const g = c.ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, "#03030d");
    g.addColorStop(0.6, "#0f0b26");
    g.addColorStop(1, "#3a1a2c");
    c.ctx.fillStyle = g;
    c.ctx.fillRect(0, 0, w, horizon + 1);
    c.ctx.fillStyle = "#020208";
    c.ctx.fillRect(0, horizon, w, h - horizon);
    sky = c.canvas;
    stars = makeStars(mulberry32(hashString(`${io.seed}:lstars`)), w, horizon * 0.95, Math.round((w * horizon) / 2000));
    skyline = makeSkyline(mulberry32(hashString(`${io.seed}:bank`)), w, horizon + 1, h * 0.09, "#05030a");
    mirror = offscreen(w, horizon, 0.5);
    void layoutText();
  }

  layout();
  io.hint(`Tap to release a lantern · 1 of ${needed}`);

  function release(x: number) {
    if (released >= needed && massT === Infinity) return;
    const idx = released < needed ? released : -1;
    const gold = released === needed - 1;
    released++;
    const y0 = h * 0.95;
    lanterns.push({
      x: clamp(x, w * 0.12, w * 0.88),
      y: y0,
      y0,
      vy: 0,
      scale: s0 * (gold ? 1.25 : 1),
      born: time,
      sway: rand() * 6.28,
      gold,
      near: true,
      phrase: idx,
    });
    io.sound.whoosh();
    if (released < needed) io.hint(`Tap to release a lantern · ${released + 1} of ${needed}`);
    else if (released === needed) io.hint("");
  }

  function spawnDistant(near = false, scatter = false) {
    const depth = near ? 0.35 + rand() * 0.3 : 0.08 + rand() * 0.24;
    // During the mass release most appear already aloft (fading in), so the
    // sky fills at once instead of trickling up from the far bank.
    const y0 = near ? h * (0.72 + rand() * 0.2) : scatter ? horizon - rand() * horizon * 0.7 : horizon - rand() * 4;
    lanterns.push({
      x: rand() * w,
      y: y0,
      y0,
      vy: 0,
      scale: s0 * depth,
      born: time,
      sway: rand() * 6.28,
      gold: rand() < 0.15,
      near,
      phrase: -2,
    });
  }

  function drawLantern(l: Lantern, t: number) {
    const age = time - l.born;
    const lift = clamp(age / 0.9);
    const k = clamp((l.y0 - l.y) / (h * 0.9));
    const sc = l.scale * (l.near ? lerp(1, 0.32, k) : 1) * (0.85 + 0.15 * lift);
    const W = 50 * sc;
    const H = 75 * sc;
    const flick = 0.85 + 0.15 * Math.sin(t * 9 + l.sway * 3);
    ctx.globalCompositeOperation = "lighter";
    stamp(ctx, glow(l.gold ? "#ffcf4a" : "#ff8f2a", 0.25), l.x, l.y + H * 0.1, H * 3.2, 0.32 * flick * lift);
    ctx.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(Math.sin(t * 0.9 + l.sway) * 0.06);
    ctx.globalAlpha = lift * (l.near ? 1 : clamp((h * 0.02 + l.y) / (h * 0.2)));
    ctx.drawImage(l.gold ? goldSprite : sprite, -W, -H, W * 2, H * 2);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  return {
    resize() {
      layout();
    },

    down(x) {
      if (released < needed || massT < Infinity) {
        if (massT < Infinity) {
          // After the finale, taps still release lanterns — no words, just light.
          lanterns.push({ x, y: h * 0.95, y0: h * 0.95, vy: 0, scale: s0 * 0.9, born: time, sway: rand() * 6.28, gold: rand() < 0.3, near: true, phrase: -2 });
          io.sound.whoosh();
        } else {
          release(x);
        }
      }
    },

    key() {
      if (released < needed) release(w * (0.25 + rand() * 0.5));
    },

    frame(dt, t) {
      time = t;

      // --- update -------------------------------------------------------
      for (const l of lanterns) {
        const lift = clamp((time - l.born) / 0.9);
        const target = l.near ? -(42 + (l.phrase >= 0 ? 6 : 0)) * s0 : -(10 + l.scale * 60);
        l.vy = lerp(l.vy, target, 1 - Math.pow(0.4, dt));
        l.y += l.vy * dt * lift;
        l.x += Math.sin(time * 0.5 + l.sway) * 6 * dt + 4 * dt;

        // Words detach as their lantern passes the line they belong on.
        const id = l.gold ? -1 : l.phrase;
        if (l.phrase !== -2 && !words.some((wd) => wd.id === id)) {
          const pos = slot(id);
          if (l.y <= pos.sy + 40 * s0) {
            words.push({
              id,
              text: l.gold ? io.to.trim() || "You" : phrases[l.phrase],
              ...pos,
              big: l.gold,
              leftAt: time,
              fromX: l.x,
              fromY: l.y + 50 * s0,
            });
            io.sound.bell(l.gold ? 783.99 : 523.25 + 70 * l.phrase, 0.1);
            if (l.gold) {
              massT = time + 1.2;
              io.sound.chime();
            }
          }
        }
      }
      for (let i = lanterns.length - 1; i >= 0; i--) if (lanterns[i].y < -120) lanterns.splice(i, 1);

      if (released > 0) {
        const rate = massT <= time ? (time - massT < 4 ? 40 : 3) : 0.7;
        bgAccum += rate * dt;
        while (bgAccum >= 1 && lanterns.length < 280) {
          bgAccum -= 1;
          const mass = massT <= time && time - massT < 4;
          spawnDistant(mass && rand() < 0.22, mass && rand() < 0.6);
        }
      }
      if (!finaleSent && massT < Infinity && time > massT + 2.4) {
        finaleSent = true;
        io.finale();
        io.hint("Tap to release more");
      }

      // --- draw: everything above the water -----------------------------
      ctx.drawImage(sky, 0, 0, w, h);
      drawStars(ctx, stars, t, 0.9);

      const far = lanterns.filter((l) => !l.near).sort((a, b) => a.scale - b.scale);
      for (const l of far) drawLantern(l, t);

      drawSkyline(ctx, skyline, w, horizon + 1, 0.55 + clamp((time - massT) / 3) * 0.6, t, 0.9);

      // The words in the sky, drawn before the mirror so the river shows them too.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const wd of words) {
        const k = easeOutCubic((time - wd.leftAt) / 1.3);
        const x = lerp(wd.fromX, wd.sx, k);
        const y = lerp(wd.fromY, wd.sy, k);
        const px = lerp(wd.px * 0.6, wd.px, k);
        ctx.font = wd.big ? `700 ${px}px ${F.script}` : `italic ${px}px ${F.serif}`;
        ctx.globalAlpha = clamp(k * 1.4);
        ctx.fillStyle = wd.big ? "#ffe39a" : "#ffeacc";
        ctx.shadowColor = wd.big ? "rgba(255,190,60,0.95)" : "rgba(255,150,60,0.8)";
        ctx.shadowBlur = wd.big ? 22 : 12;
        ctx.fillText(wd.text, x, y);
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // --- the river ----------------------------------------------------
      // One snapshot of the sky per frame, then wobbling strips from it.
      // Drawing the canvas onto itself strip by strip forced a full-canvas
      // copy per strip — a hundred of them a frame.
      mirror.ctx.drawImage(canvas, 0, 0, canvas.width, Math.round(horizon * stage.dpr), 0, 0, w, horizon);
      const step = 3;
      for (let y = horizon; y < h; y += step) {
        const d = y - horizon;
        const src = horizon - d * 0.85 - 1;
        if (src < 0) break;
        const off = Math.sin(d * 0.08 + t * 1.5) * (1 + d * 0.035);
        ctx.drawImage(mirror.canvas, 0, Math.floor(src * 0.5), mirror.canvas.width, 2, off, y, w, step);
      }
      const water = ctx.createLinearGradient(0, horizon, 0, h);
      water.addColorStop(0, "rgba(4,6,20,0.45)");
      water.addColorStop(1, "rgba(1,2,8,0.88)");
      ctx.fillStyle = water;
      ctx.fillRect(0, horizon, w, h - horizon);
      ctx.fillStyle = "rgba(255,190,120,0.12)";
      ctx.fillRect(0, horizon, w, 1);

      // Diyas floating downstream, each with its streak of reflection.
      ctx.globalCompositeOperation = "lighter";
      for (const f of floaters) {
        f.u = (f.u + f.speed * dt) % 1.1;
        const depth = f.d;
        const y = lerp(horizon + 8, h * 0.9, depth * depth);
        const x = f.u * (w + 40) - 20;
        const sz = lerp(3, 12, depth * depth) * s0 + 2;
        const fl = 0.8 + 0.2 * Math.sin(t * 8 + f.seed);
        ctx.globalAlpha = 0.3 * fl;
        ctx.drawImage(glow("#ff9a3a"), x - sz, y, sz * 2, sz * 9);
        ctx.globalAlpha = 1;
        stamp(ctx, glow("#ffcf7a", 0.3), x, y, sz * 3.2, 0.9 * fl);
        stamp(ctx, glow("#ffffff", 0.4), x, y - sz * 0.15, sz * 0.8, fl);
      }
      ctx.globalCompositeOperation = "source-over";

      // Ghat steps in the foreground.
      ctx.fillStyle = "#07040a";
      ctx.fillRect(0, h * 0.935, w, h * 0.07);
      ctx.fillStyle = "#0b070e";
      ctx.fillRect(0, h * 0.965, w, h * 0.04);
      ctx.fillStyle = "rgba(255,170,100,0.08)";
      ctx.fillRect(0, h * 0.935, w, 1);
      ctx.fillRect(0, h * 0.965, w, 1);

      // Near lanterns, in front of everything, with their words attached.
      const near = lanterns.filter((l) => l.near).sort((a, b) => b.y - a.y);
      for (const l of near) {
        drawLantern(l, t);
        if (l.phrase === -2) continue;
        const text = l.gold ? io.to.trim() || "You" : phrases[l.phrase];
        if (words.some((wd) => wd.id === (l.gold ? -1 : l.phrase))) continue;
        ctx.globalAlpha = clamp((time - l.born) / 0.8);
        ctx.font = l.gold ? `700 ${Math.round(namePx * 0.6)}px ${F.script}` : `italic ${Math.round(linePx * 0.6)}px ${F.serif}`;
        ctx.fillStyle = "#ffe7c4";
        ctx.shadowColor = "rgba(255,150,60,0.8)";
        ctx.shadowBlur = 8;
        ctx.fillText(text, l.x, l.y + 50 * s0 * (l.gold ? 1.25 : 1));
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      if (released === 0 && t > 2.5) {
        // A ghost lantern bobbing at the water's edge until the first tap.
        const k = 0.5 + 0.5 * Math.sin(t * 2);
        ctx.globalAlpha = 0.35 + 0.25 * k;
        ctx.drawImage(sprite, w / 2 - 25 * s0, h * 0.86 - 37 * s0 - k * 6, 50 * s0, 75 * s0);
        ctx.globalAlpha = 1;
      }
    },
  };
};
