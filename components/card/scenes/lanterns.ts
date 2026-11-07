// Scene 4 — Sky Lanterns.
//
// A river ghat on Diwali night: the far bank lit, diyas floating on black
// water, the sky mirrored in it. Press and hold on the water to light a paper
// lantern, let go (or flick up) to release it; each of the first few carries a
// piece of the sender's wish and leaves those words in the sky. The last,
// golden one carries the recipient's name — and then the whole far bank lets
// theirs go too. After that the sky is a toy: tap a lantern and it chimes,
// swipe and a breeze carries them.
//
// Performance notes, because this scene used to stutter:
// - Glowing text is rendered once into sprites. `shadowBlur` on `fillText`
//   every frame is the single most expensive thing canvas 2D can do.
// - The river does not read the canvas back. Its reflection of the sky and
//   bank is rendered once per layout; lanterns are mirrored as glow stamps.

import {
  clamp,
  drawParticles,
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
  stepParticles,
  type Particle,
  type SceneFactory,
  type Skyline,
  type Star,
} from "./engine";

interface Lantern {
  x: number;
  y: number;
  y0: number;
  vx: number;
  vy: number;
  scale: number;
  born: number;
  sway: number;
  gold: boolean;
  /** Foreground lanterns rise from the ghat; distant ones from the far bank. */
  near: boolean;
  /** Index into `phrases`, -1 for the name, -2 for a lantern with no words. */
  phrase: number;
  /** Words already handed to the sky. */
  detached: boolean;
  /** When it was last tapped, for the chime flash. */
  pulse: number;
}

interface Words {
  /** Phrase index, or -1 for the name. */
  id: number;
  text: string;
  big: boolean;
  /** When it left its lantern. */
  leftAt: number;
  fromX: number;
  fromY: number;
  settled: boolean;
}

interface Charge {
  x: number;
  /** Where the press started, for flick detection. */
  y0: number;
  k: number;
}

interface WordSprite {
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
}

const DEFAULT_WISH = "May every diya bring you one good year";
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
const MAX_LANTERNS = 220;
/** Seconds of holding for a lantern to fill and launch by itself. */
const CHARGE_S = 0.85;
const FLIGHT_S = 1.4;

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
  ctx.strokeStyle = gold ? "rgba(120,80,0,0.22)" : "rgba(120,30,0,0.22)";
  ctx.lineWidth = 1;
  for (const k of [-0.5, 0, 0.5]) {
    ctx.beginPath();
    ctx.moveTo(50 + wt * k, top + 2);
    ctx.lineTo(50 + wb * k, bot);
    ctx.stroke();
  }
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
  const { ctx } = stage;
  const rand = mulberry32(hashString(`${io.seed}:lanterns`));
  const F = fonts();

  const phrases = chunk(io.wish?.trim() || DEFAULT_WISH);
  const needed = phrases.length + 1;
  const name = io.to.trim() || "You";

  let w = 0;
  let h = 0;
  let horizon = 0;
  let s0 = 1;
  let sky: HTMLCanvasElement;
  let stars: Star[] = [];
  let skyline: Skyline;
  /** The river's reflection of sky and bank, flipped and darkened, built per layout. */
  let reflection: ReturnType<typeof offscreen>;
  const sprite = lanternSprite(false);
  const goldSprite = lanternSprite(true);

  const lanterns: Lantern[] = [];
  const words: Words[] = [];
  const embers: Particle[] = [];
  const wordSprites = new Map<string, WordSprite>();
  let charge: Charge | null = null;
  let released = 0;
  let time = 0;
  let massT = Infinity;
  let finaleSent = false;
  let bgAccum = 0;
  let last = { x: 0, y: 0 };
  let lastAction = 0;
  let stuckTipped = false;

  const floaters = Array.from({ length: 12 }, () => ({ u: rand(), d: rand(), speed: 0.004 + rand() * 0.008, seed: rand() * 10 }));

  let namePx = 48;
  let linePx = 20;

  async function layoutText() {
    const nameFont = (px: number) => `700 ${px}px ${F.script}`;
    const lineFont = (px: number) => `italic ${px}px ${F.serif}`;
    await Promise.all([ensureFont(nameFont(60)), ensureFont(lineFont(24))]);
    const probe = offscreen(2, 2).ctx;
    namePx = fitText(probe, name, nameFont, w * 0.84, Math.min(h * 0.11, 92), 26);
    const longest = phrases.reduce((a, b) => (a.length > b.length ? a : b), "");
    linePx = fitText(probe, longest, lineFont, w * 0.86, Math.min(h * 0.04, 28), 13);
    // Fonts are in (or the size changed): any sprite drawn before is stale.
    wordSprites.clear();
  }

  /** Glowing text, rendered once. */
  function wordSprite(text: string, big: boolean): WordSprite {
    const px = big ? namePx : linePx;
    const key = `${big ? 1 : 0}|${px}|${text}`;
    const hit = wordSprites.get(key);
    if (hit) return hit;
    const font = big ? `700 ${px}px ${F.script}` : `italic ${px}px ${F.serif}`;
    const probe = offscreen(2, 2).ctx;
    probe.font = font;
    const pad = px * (big ? 0.9 : 0.7);
    const W = Math.ceil(probe.measureText(text).width + pad * 2);
    const H = Math.ceil(px * 2.4);
    const o = offscreen(W, H, Math.min(2, stage.dpr));
    o.ctx.font = font;
    o.ctx.textAlign = "center";
    o.ctx.textBaseline = "middle";
    o.ctx.fillStyle = big ? "#ffe39a" : "#ffeacc";
    o.ctx.shadowColor = big ? "rgba(255,190,60,0.95)" : "rgba(255,150,60,0.85)";
    o.ctx.shadowBlur = big ? 22 : 12;
    o.ctx.fillText(text, W / 2, H / 2);
    o.ctx.shadowBlur = 0;
    o.ctx.fillText(text, W / 2, H / 2);
    const out = { canvas: o.canvas, w: W, h: H };
    wordSprites.set(key, out);
    return out;
  }

  function drawWord(text: string, big: boolean, x: number, y: number, scale: number, alpha: number) {
    if (alpha <= 0.01) return;
    const sp = wordSprite(text, big);
    ctx.globalAlpha = alpha;
    ctx.drawImage(sp.canvas, x - (sp.w * scale) / 2, y - (sp.h * scale) / 2, sp.w * scale, sp.h * scale);
    ctx.globalAlpha = 1;
  }

  function slot(i: number) {
    const nameY = h * 0.1 + namePx * 0.4;
    if (i < 0) return { sx: w / 2, sy: nameY };
    // Clear of the script's descenders (the "y" in Riya hangs a long way).
    return { sx: w / 2, sy: nameY + namePx * 0.98 + linePx * 0.3 + i * linePx * 1.55 };
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

    // The reflection: sky and bank flipped about the horizon, squashed a
    // little (water foreshortens), then darkened toward the viewer.
    const rh = h - horizon;
    reflection = offscreen(w, rh, 0.5);
    const r = reflection.ctx;
    // Sky y maps to water y' = (horizon − y)·0.85: the waterline at the top.
    r.save();
    r.translate(0, horizon * 0.85);
    r.scale(1, -0.85);
    r.drawImage(sky, 0, 0, w, horizon, 0, 0, w, horizon);
    drawSkyline(r, skyline, w, horizon + 1, 0.6, 0, 0.6);
    r.restore();
    const shade = r.createLinearGradient(0, 0, 0, rh);
    shade.addColorStop(0, "rgba(4,6,20,0.35)");
    shade.addColorStop(1, "rgba(1,2,8,0.92)");
    r.fillStyle = shade;
    r.fillRect(0, 0, w, rh);

    void layoutText();
  }

  layout();

  /** The hint for the lantern about to be lit (0-based). */
  const nextHint = (i: number) =>
    i === 0
      ? `Press and hold on the water to light a lantern · 1 of ${needed}`
      : i === needed - 1
        ? `Last one — the golden lantern carries a name · ${needed} of ${needed}`
        : i === 1
          ? `Light the next one — flick upward to launch it fast · 2 of ${needed}`
          : `Swipe across the sky to send a breeze · lantern ${i + 1} of ${needed}`;

  io.hint(nextHint(0));

  function release(x: number, k: number) {
    const story = released < needed;
    const gold = story ? released === needed - 1 : rand() < 0.25;
    const phrase = story ? (gold ? -1 : released) : -2;
    if (story) released++;
    const y0 = h * 0.9;
    lanterns.push({
      x: clamp(x, w * 0.1, w * 0.9),
      y: y0,
      y0,
      vx: 0,
      vy: -(140 + 170 * k) * s0,
      scale: s0 * (gold && story ? 1.25 : 1),
      born: time,
      sway: rand() * 6.28,
      gold,
      near: true,
      phrase,
      detached: phrase === -2,
      pulse: -10,
    });
    io.sound.setHiss(0);
    io.sound.whoosh();
    io.sound.bell(gold ? 659.25 : 440, 0.05);
    lastAction = time;
    stuckTipped = false;
    if (!story) return;
    if (released < needed) io.hint(nextHint(released));
    else io.hint("Watch the wishes rise into the sky ✨");
  }

  function spawnDistant(near: boolean, scatter: boolean) {
    const depth = near ? 0.35 + rand() * 0.3 : 0.08 + rand() * 0.24;
    // During the mass release most appear already aloft (fading in), so the
    // sky fills at once instead of trickling up from the far bank.
    const y0 = near ? h * (0.72 + rand() * 0.2) : scatter ? horizon - rand() * horizon * 0.7 : horizon - rand() * 4;
    lanterns.push({
      x: rand() * w,
      y: y0,
      y0,
      vx: 0,
      vy: 0,
      scale: s0 * depth,
      born: time,
      sway: rand() * 6.28,
      gold: rand() < 0.15,
      near,
      phrase: -2,
      detached: true,
      pulse: -10,
    });
  }

  function lanternScale(l: Lantern) {
    const k = clamp((l.y0 - l.y) / (h * 0.9));
    return l.scale * (l.near ? lerp(1, 0.38, k) : 1);
  }

  /** The topmost lantern under a point, if any. */
  function lanternAt(x: number, y: number) {
    for (let i = lanterns.length - 1; i >= 0; i--) {
      const l = lanterns[i];
      const sc = lanternScale(l);
      if (sc < s0 * 0.14 || time - l.born < 0.3) continue;
      const r = Math.max(26, 62 * sc);
      if (Math.hypot(x - l.x, y - (l.y - 8 * sc)) < r) return l;
    }
    return null;
  }

  function sparkle(x: number, y: number, n: number, color: string, speed = 120) {
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const sp = speed * (0.3 + rand() * 0.7);
      embers.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.5 + rand() * 0.6, max: 1.1, color, size: 1.6, drag: 0.92, gravity: 30, twinkle: true });
    }
  }

  function chime(l: Lantern) {
    l.pulse = time;
    l.vy -= 30 * s0;
    const k = clamp(1 - l.y / horizon);
    io.sound.bell(PENTATONIC[Math.min(PENTATONIC.length - 1, Math.floor(k * PENTATONIC.length))], 0.12);
    sparkle(l.x, l.y - 10 * lanternScale(l), 14, l.gold ? "#ffe08a" : "#ffb347", 150);
    lastAction = time;
  }

  function drawLantern(l: Lantern, t: number) {
    const lift = clamp((time - l.born) / 0.5);
    const sc = lanternScale(l) * (0.85 + 0.15 * lift);
    const W = 50 * sc;
    const H = 75 * sc;
    const flash = clamp(1 - (time - l.pulse) / 0.6);
    const flick = 0.85 + 0.15 * Math.sin(t * 9 + l.sway * 3);
    const fade = l.near ? lift : clamp((time - l.born) / 0.8) * clamp((h * 0.02 + l.y) / (h * 0.2));
    ctx.globalCompositeOperation = "lighter";
    stamp(ctx, glow(l.gold ? "#ffcf4a" : "#ff8f2a", 0.25), l.x, l.y + H * 0.1, H * (3 + flash * 2), (0.3 * flick + flash * 0.5) * fade);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = fade;
    const img = l.gold ? goldSprite : sprite;
    if (sc < s0 * 0.3) {
      // Distant: no rotation, no save/restore — these are most of the sky.
      ctx.drawImage(img, l.x - W, l.y - H, W * 2, H * 2);
    } else {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(Math.sin(t * 0.9 + l.sway) * 0.06 + clamp(l.vx / 400, -0.2, 0.2));
      ctx.drawImage(img, -W, -H, W * 2, H * 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function launchCharge() {
    if (!charge) return;
    const c = charge;
    charge = null;
    release(c.x, Math.max(c.k, 0.3));
  }

  return {
    resize() {
      layout();
    },

    down(x, y) {
      last = { x, y };
      lastAction = time;
      const hit = lanternAt(x, y);
      if (hit) {
        chime(hit);
        return;
      }
      // The water lights lanterns; the sky is for breezes.
      if (y > horizon - h * 0.05 && !charge) {
        charge = { x: clamp(x, w * 0.1, w * 0.9), y0: y, k: 0 };
        io.sound.crackle(3, 0.2, 0.1);
        if (released === 0) io.hint("Keep holding… let go when it glows");
      }
    },

    move(x, y, _e, pressed) {
      const dx = x - last.x;
      const dy = y - last.y;
      last = { x, y };
      if (!pressed) return;
      if (charge) {
        charge.x = clamp(x, w * 0.1, w * 0.9);
        // A flick upward throws it.
        if (charge.y0 - y > 50 && dy < -4) launchCharge();
        return;
      }
      // Breeze: nudge every lantern near the swipe along with it.
      const R = 170 * s0;
      for (const l of lanterns) {
        const d = Math.hypot(l.x - x, l.y - y);
        if (d < R) {
          const f = 1 - d / R;
          l.vx = clamp(l.vx + dx * 9 * f, -260, 260);
          l.vy += dy * 2 * f;
        }
      }
      if (Math.abs(dx) > 3 && rand() < 0.5) {
        embers.push({ x, y, vx: dx * 12, vy: dy * 6, life: 0.5, max: 0.5, color: "#ffd9a8", size: 1.2, drag: 0.9, gravity: 0, streak: true });
      }
      if (Math.abs(dx) > 6) lastAction = time;
    },

    up() {
      launchCharge();
    },

    key() {
      lastAction = time;
      release(w * (0.25 + rand() * 0.5), 1);
    },

    frame(dt, t) {
      time = t;

      // --- the lantern being lit -------------------------------------------
      if (charge) {
        charge.k = Math.min(1, charge.k + dt / CHARGE_S);
        io.sound.setHiss(0.06 + charge.k * 0.16, 1800 + charge.k * 1400);
        if (rand() < dt * 30) {
          embers.push({ x: charge.x + (rand() - 0.5) * 10 * s0, y: h * 0.9 - 6 * s0, vx: (rand() - 0.5) * 30, vy: -60 - rand() * 80, life: 0.6, max: 0.6, color: "#ffc46b", size: 1.5, drag: 0.94, gravity: -20 });
        }
        if (charge.k >= 1) {
          io.sound.ignite();
          sparkle(charge.x, h * 0.9 - 30 * s0, 18, "#ffd27a", 160);
          launchCharge();
        }
      }

      // --- lanterns --------------------------------------------------------
      for (const l of lanterns) {
        const target = l.near ? -62 * s0 : -(10 + l.scale * 60);
        l.vy = lerp(l.vy, target, 1 - Math.pow(0.45, dt));
        l.vx *= Math.pow(0.35, dt);
        l.y += l.vy * dt;
        l.x += (l.vx + Math.sin(time * 0.5 + l.sway) * 6 + 4) * dt;

        // Words leave their lantern early and fly up to their line, so a
        // wish never makes anyone wait for a lantern to drift the whole way.
        if (!l.detached && (time - l.born > 1.5 || l.y < h * 0.5)) {
          l.detached = true;
          words.push({ id: l.phrase, text: l.phrase === -1 ? name : phrases[l.phrase], big: l.phrase === -1, leftAt: time, fromX: l.x, fromY: l.y + 50 * lanternScale(l), settled: false });
          io.sound.bell(l.phrase === -1 ? 783.99 : 523.25 + 70 * l.phrase, 0.1);
          if (l.phrase === -1) {
            io.hint("");
            massT = time + FLIGHT_S + 0.4;
          }
        }
      }
      for (let i = lanterns.length - 1; i >= 0; i--) if (lanterns[i].y < -120) lanterns.splice(i, 1);

      if (released > 0) {
        const mass = massT <= time && time - massT < 4;
        const rate = mass ? 32 : massT <= time ? 3 : 0.8;
        bgAccum += rate * dt;
        while (bgAccum >= 1) {
          bgAccum -= 1;
          if (lanterns.length < MAX_LANTERNS) spawnDistant(mass && rand() < 0.2, mass && rand() < 0.6);
        }
      }
      if (!finaleSent && massT < Infinity && time > massT + 2.4) {
        finaleSent = true;
        io.sound.chime();
        io.finale();
        io.hint("Tap a lantern to make it chime · hold on the water for more");
      }
      if (released < needed && !charge && !stuckTipped && time - lastAction > 7 && time > 4) {
        stuckTipped = true;
        io.hint("Tip: press and hold on the water, then let go");
      }

      // --- sky -------------------------------------------------------------
      ctx.drawImage(sky, 0, 0, w, h);
      drawStars(ctx, stars, t, 0.9);
      for (const l of lanterns) if (!l.near) drawLantern(l, t);
      drawSkyline(ctx, skyline, w, horizon + 1, 0.55 + clamp((time - massT) / 3) * 0.6, t, 0.9);

      // Words: in flight trailing embers, then settled in their line.
      for (const wd of words) {
        const k = easeOutCubic((time - wd.leftAt) / FLIGHT_S);
        const to = slot(wd.id);
        const x = lerp(wd.fromX, to.sx, k) + Math.sin(k * Math.PI) * 40 * s0 * (wd.fromX < w / 2 ? -1 : 1);
        const y = lerp(wd.fromY, to.sy, k);
        if (k < 1 && rand() < 0.8) {
          embers.push({ x: x + (rand() - 0.5) * 30, y: y + (rand() - 0.5) * 10, vx: (rand() - 0.5) * 20, vy: 20 + rand() * 30, life: 0.7, max: 0.7, color: wd.big ? "#ffe08a" : "#ffb37a", size: 1.4, drag: 0.95, gravity: 10 });
        }
        if (k >= 1 && !wd.settled) {
          wd.settled = true;
          sparkle(to.sx, to.sy, wd.big ? 30 : 14, wd.big ? "#ffe39a" : "#ffd2a0", wd.big ? 220 : 120);
        }
        drawWord(wd.text, wd.big, x, y, lerp(0.55, 1, k), clamp(k * 1.6));
      }

      // --- the river ---------------------------------------------------------
      // The pre-rendered reflection in bands, each swaying a little.
      const rh = h - horizon;
      const band = 14;
      const src = reflection.canvas;
      const sy = src.height / rh;
      for (let y = 0; y < rh; y += band) {
        const off = Math.sin(y * 0.07 + t * 1.4) * (1 + y * 0.03);
        ctx.drawImage(src, 0, y * sy, src.width, band * sy, off, horizon + y, w, band + 1);
      }
      ctx.fillStyle = "rgba(255,190,120,0.12)";
      ctx.fillRect(0, horizon, w, 1);

      ctx.globalCompositeOperation = "lighter";
      // Lanterns mirrored as long, shivering streaks of light.
      for (const l of lanterns) {
        if (l.y > horizon) continue;
        const my = horizon + (horizon - l.y) * 0.85;
        if (my > h * 0.93) continue;
        const sc = lanternScale(l);
        const sz = 70 * sc;
        const wob = Math.sin(t * 2.2 + l.sway * 4 + my * 0.05) * 3;
        ctx.globalAlpha = (l.near ? 0.32 : 0.22) * clamp((time - l.born) / 0.8);
        ctx.drawImage(glow(l.gold ? "#ffcf4a" : "#ff8f2a"), l.x - sz * 0.35 + wob, my - sz * 0.9, sz * 0.7, sz * 1.8);
      }
      ctx.globalAlpha = 1;

      // Diyas floating downstream, each with its streak of reflection.
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

      // --- the lantern being lit, inflating as it fills ------------------------
      if (charge) {
        const k = charge.k;
        const W = 50 * s0;
        const H = 75 * s0 * lerp(0.6, 1, easeOutCubic(k));
        const gy = h * 0.9;
        ctx.globalCompositeOperation = "lighter";
        stamp(ctx, glow("#ff9a3a", 0.25), charge.x, gy - H * 0.4, H * (1.5 + k * 2.5), 0.2 + k * 0.5);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.45 + k * 0.55;
        ctx.drawImage(sprite, charge.x - W, gy - H * 1.7, W * 2, H * 2);
        ctx.globalAlpha = 1;
        // A ring filling around it says "keep holding" without words.
        ctx.strokeStyle = "rgba(255,214,150,0.85)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(charge.x, gy - H * 0.7, H * 1.05, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2);
        ctx.stroke();
      }

      // Near lanterns, in front of everything, with their words attached.
      const near = lanterns.filter((l) => l.near).sort((a, b) => b.y - a.y);
      for (const l of near) {
        drawLantern(l, t);
        if (l.detached) continue;
        const sc = lanternScale(l);
        drawWord(l.phrase === -1 ? name : phrases[l.phrase], l.phrase === -1, l.x, l.y + 52 * sc, 0.58, clamp((time - l.born) / 0.5));
      }

      stepParticles(embers, dt);
      if (embers.length > 500) embers.splice(0, embers.length - 500);
      drawParticles(ctx, embers, 4);

      if (released === 0 && !charge && t > 2) {
        // A ghost lantern bobbing at the water's edge until the first press.
        const k = 0.5 + 0.5 * Math.sin(t * 2);
        ctx.globalAlpha = 0.3 + 0.25 * k;
        ctx.drawImage(sprite, w / 2 - 25 * s0, h * 0.86 - 37 * s0 - k * 6, 50 * s0, 75 * s0);
        ctx.globalAlpha = 1;
        // ...and a pulsing ring where to press.
        const r = (22 + k * 10) * s0;
        ctx.strokeStyle = `rgba(255,214,150,${0.25 + 0.3 * (1 - k)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.9, r * 1.6, r * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  };
};
