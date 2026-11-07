// The tiny engine every opening scene runs on.
//
// Plain Canvas 2D, no dependencies. The scenes are factories rather than React
// components: React mounts one <canvas>, and everything after that is a
// requestAnimationFrame loop that never touches React state, because a
// re-render per frame on a mid-range Android phone is the difference between
// a firework and a slideshow.

import { useEffect, useRef } from "react";
import { mulberry32, hashString } from "@/lib/rand";
import type { Sound } from "./sound";

export { mulberry32, hashString };

export interface Stage {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** CSS pixels. The context is pre-scaled, so draw in these. */
  w: number;
  h: number;
  dpr: number;
}

/** What a scene gets from the player. Fixed for the lifetime of one mount. */
export interface SceneIO {
  to: string;
  from: string;
  wish?: string;
  /** Seeds per-letter variation (the rangoli pattern, the skyline). */
  seed: string;
  sound: Sound;
  /** The one line of instruction under the scene. Empty string hides it. */
  hint: (text: string) => void;
  /** Call once, when the scene has delivered its moment; shows "Read the letter". */
  finale: () => void;
}

export interface SceneLoop {
  frame(dt: number, t: number): void;
  resize?(w: number, h: number): void;
  down?(x: number, y: number, e: PointerEvent): void;
  move?(x: number, y: number, e: PointerEvent, pressed: boolean): void;
  up?(e: PointerEvent): void;
  /** Enter / Space on the focused canvas — the keyboard path through the scene. */
  key?(key: string): void;
  destroy?(): void;
}

export type SceneFactory = (stage: Stage, io: SceneIO) => SceneLoop;

/**
 * Mounts a scene on a canvas: DPR-correct sizing, resize, the frame loop and
 * pointer plumbing. Returns the ref and a key handler for the canvas.
 */
export function useScene(factory: SceneFactory, io: SceneIO) {
  const ref = useRef<HTMLCanvasElement>(null);
  const loopRef = useRef<SceneLoop | null>(null);
  const ioRef = useRef(io);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stage: Stage = { canvas, ctx, w: 1, h: 1, dpr: 1 };

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      // Cap the backing store: a 4K monitor at DPR 2 is 33M pixels per
      // full-screen composite, and these scenes do several per frame.
      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      while (dpr > 1 && w * h * dpr * dpr > 4_200_000) dpr -= 0.25;
      stage.w = w;
      stage.h = h;
      stage.dpr = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    size();
    const loop = factory(stage, {
      ...ioRef.current,
      hint: (t) => ioRef.current.hint(t),
      finale: () => ioRef.current.finale(),
    });
    loopRef.current = loop;

    let raf = 0;
    let last = performance.now();
    const start = last;
    const tick = (now: number) => {
      // Clamp: a backgrounded tab resumes with a multi-second dt, which would
      // otherwise teleport every particle off-screen in one frame.
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      ctx.setTransform(stage.dpr, 0, 0, stage.dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      loop.frame(dt, (now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      size();
      loop.resize?.(stage.w, stage.h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    let pressed = false;
    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top] as const;
    };
    const onDown = (e: PointerEvent) => {
      pressed = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic events have no capturable pointer; harmless.
      }
      const [x, y] = local(e);
      loop.down?.(x, y, e);
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = local(e);
      loop.move?.(x, y, e, pressed);
    };
    const onUp = (e: PointerEvent) => {
      pressed = false;
      loop.up?.(e);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      loop.destroy?.();
      loopRef.current = null;
    };
    // A scene is mounted once per player; the player is keyed by scene id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ioRef.current = io;
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      loopRef.current?.key?.(e.key);
    }
  };

  return { ref, onKeyDown };
}

// ---------------------------------------------------------------------------
// Offscreen helpers
// ---------------------------------------------------------------------------

export function offscreen(w: number, h: number, dpr = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { canvas, ctx };
}

const spriteCache = new Map<string, HTMLCanvasElement>();

/**
 * A soft radial glow, rendered once and stamped with drawImage. Creating a
 * gradient per particle per frame is what makes naive canvas fireworks stutter.
 */
export function glow(color: string, hard = 0.18): HTMLCanvasElement {
  const key = `${color}|${hard}`;
  const hit = spriteCache.get(key);
  if (hit) return hit;
  const size = 128;
  const { canvas, ctx } = offscreen(size, size);
  const [r, g, b] = rgb(color);
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grad.addColorStop(hard, `rgba(${r},${g},${b},0.55)`);
  grad.addColorStop(0.5, `rgba(${r},${g},${b},0.12)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  spriteCache.set(key, canvas);
  return canvas;
}

/** Stamp a glow sprite centred on (x, y) with diameter `d`. */
export function stamp(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  d: number,
  alpha = 1,
) {
  if (alpha <= 0.002 || d <= 0.5) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(sprite, x - d / 2, y - d / 2, d, d);
  ctx.globalAlpha = 1;
}

export function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/**
 * The real family name behind a next/font CSS variable. next/font hashes the
 * family, so "Dancing Script" by name would silently fall back to the default.
 */
export function cssFont(variable: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

export const fonts = () => ({
  script: cssFont("--font-dancing", "cursive"),
  serif: cssFont("--font-playfair", "Georgia, serif"),
});

/** Largest font size (≤ max) at which `text` fits in `maxWidth`. */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (px: number) => string,
  maxWidth: number,
  max: number,
  min = 12,
): number {
  let size = max;
  while (size > min) {
    ctx.font = font(size);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

export interface Pt {
  x: number;
  y: number;
}

/**
 * Rasterise whatever `draw` paints and return a point every `gap` pixels where
 * it is opaque. The basis for every "particles become your name" moment.
 */
export function sampleDrawing(
  w: number,
  h: number,
  gap: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  maxPoints = 1400,
): Pt[] {
  const { canvas, ctx } = offscreen(w, h);
  draw(ctx);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let step = Math.max(1, Math.round(gap));
  for (;;) {
    const out: Pt[] = [];
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        if (data[(y * canvas.width + x) * 4 + 3] > 140) out.push({ x, y });
      }
    }
    if (out.length <= maxPoints || step > 14) return out;
    step += 1;
  }
}

/** Await a font so text sampled from it is not sampled from the fallback. */
export async function ensureFont(font: string) {
  try {
    await document.fonts.load(font);
  } catch {
    // The fallback still renders; worst case the name is in a plainer face.
  }
}

// ---------------------------------------------------------------------------
// Easing / maths
// ---------------------------------------------------------------------------

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeOutCubic = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
export const easeInOut = (k: number) => {
  const x = clamp(k);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** Frame-rate independent damping: `v *= damp(0.98, dt)`. */
export const damp = (perFrameAt60: number, dt: number) =>
  Math.pow(perFrameAt60, dt * 60);

// ---------------------------------------------------------------------------
// Sky + skyline (shared by the scenes set outdoors)
// ---------------------------------------------------------------------------

export interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

export function makeStars(rand: () => number, w: number, h: number, count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: rand() * w,
    y: Math.pow(rand(), 1.4) * h,
    r: rand() < 0.08 ? 1.4 : 0.5 + rand() * 0.7,
    phase: rand() * Math.PI * 2,
    speed: 0.6 + rand() * 2.2,
  }));
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], t: number, dim = 1) {
  ctx.fillStyle = "#fff8e7";
  for (const s of stars) {
    const a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))) * dim;
    ctx.globalAlpha = a;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  }
  ctx.globalAlpha = 1;
}

export interface SkyWindow {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  /** 0..1 — where in the left-to-right lighting wave this one switches on. */
  wave: number;
  /** Already on before the wave, dimly. */
  early: boolean;
}

export interface Bulb {
  x: number;
  y: number;
  color: string;
  wave: number;
  phase: number;
}

export interface Skyline {
  canvas: HTMLCanvasElement;
  windows: SkyWindow[];
  bulbs: Bulb[];
}

const BULB_COLORS = ["#ffd166", "#ff7aa2", "#7ae7ff", "#ffb347", "#b8ff7a", "#ffe9a8"];

/**
 * A procedural Indian rooftop skyline — flat roofs, water tanks, domes,
 * chhatris and a temple shikhara — with the window grid and the hanging
 * "jhalar" bulb strands every Diwali facade has, returned separately so the
 * scene can switch them on in a wave.
 */
export function makeSkyline(
  rand: () => number,
  w: number,
  base: number,
  maxH: number,
  silhouette = "#06030b",
): Skyline {
  const { canvas, ctx } = offscreen(w, base + 2, Math.min(2, window.devicePixelRatio || 1));
  const windows: SkyWindow[] = [];
  const bulbs: Bulb[] = [];
  ctx.fillStyle = silhouette;

  let x = -10;
  let templeDone = false;
  while (x < w + 10) {
    const bw = 34 + rand() * 70;
    let bh = maxH * (0.32 + rand() * 0.55);
    const isTemple = !templeDone && x > w * 0.55 && rand() < 0.5;
    if (isTemple) bh = maxH * 0.55;
    const top = base - bh;
    ctx.fillRect(x, top, bw, bh + 2);

    // Roof furniture.
    const roll = rand();
    if (isTemple) {
      templeDone = true;
      const cx = x + bw / 2;
      ctx.beginPath();
      ctx.moveTo(x + bw * 0.12, top);
      ctx.bezierCurveTo(x + bw * 0.15, top - maxH * 0.35, cx - 4, top - maxH * 0.55, cx, top - maxH * 0.62);
      ctx.bezierCurveTo(cx + 4, top - maxH * 0.55, x + bw * 0.85, top - maxH * 0.35, x + bw * 0.88, top);
      ctx.fill();
      ctx.fillRect(cx - 0.75, top - maxH * 0.74, 1.5, maxH * 0.13);
      ctx.beginPath();
      ctx.moveTo(cx, top - maxH * 0.74);
      ctx.lineTo(cx + 9, top - maxH * 0.71);
      ctx.lineTo(cx, top - maxH * 0.68);
      ctx.fill();
    } else if (roll < 0.22) {
      ctx.beginPath();
      ctx.arc(x + bw / 2, top, bw * 0.32, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x + bw / 2 - 0.75, top - bw * 0.32 - 7, 1.5, 7);
    } else if (roll < 0.4) {
      const cw = Math.min(26, bw * 0.45);
      const cx = x + bw * (0.2 + rand() * 0.4);
      ctx.fillRect(cx, top - 12, 2, 12);
      ctx.fillRect(cx + cw - 2, top - 12, 2, 12);
      ctx.beginPath();
      ctx.arc(cx + cw / 2, top - 12, cw / 2, Math.PI, 0);
      ctx.fill();
    } else if (roll < 0.6) {
      ctx.fillRect(x + bw * 0.6, top - 10, 14, 10);
    }

    // Windows.
    const cols = Math.max(1, Math.floor((bw - 8) / 11));
    const rows = Math.max(1, Math.floor((bh - 10) / 13));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rand() > 0.6) continue;
        const wx = x + 6 + c * 11;
        const wy = top + 8 + r * 13;
        if (wy > base - 6) continue;
        const colourRoll = rand();
        windows.push({
          x: wx,
          y: wy,
          w: 4,
          h: 6,
          color: colourRoll < 0.75 ? "#ffcf7a" : colourRoll < 0.88 ? "#ffe9c2" : "#ff9ec4",
          wave: clamp((wx / w) * 0.85 + rand() * 0.15),
          early: rand() < 0.08,
        });
      }
    }

    // Jhalar: vertical strands of bulbs down the facade.
    if (rand() < 0.45 && !isTemple) {
      const strands = Math.floor(bw / 7);
      const colour = BULB_COLORS[Math.floor(rand() * BULB_COLORS.length)];
      const mixed = rand() < 0.4;
      for (let s = 0; s < strands; s++) {
        const len = bh * (0.35 + rand() * 0.45);
        for (let yy = 4; yy < len; yy += 7) {
          bulbs.push({
            x: x + 3 + s * 7,
            y: top + yy,
            color: mixed ? BULB_COLORS[(s + Math.floor(yy / 7)) % BULB_COLORS.length] : colour,
            wave: clamp(((x + s * 7) / w) * 0.85 + 0.05 + rand() * 0.1),
            phase: rand() * Math.PI * 2,
          });
        }
      }
    }

    x += bw + (rand() < 0.3 ? 4 + rand() * 18 : 0);
  }

  return { canvas, windows, bulbs };
}

/**
 * Draw the skyline with its lights. `lit` is the wave front (0..1+), so the
 * city switches on left to right rather than all at once.
 */
export function drawSkyline(
  ctx: CanvasRenderingContext2D,
  sky: Skyline,
  w: number,
  base: number,
  lit: number,
  t: number,
  dim = 1,
) {
  ctx.drawImage(sky.canvas, 0, 0, w, base + 2);

  for (const win of sky.windows) {
    const on = win.early ? 0.45 : 0;
    const k = Math.max(on, clamp((lit - win.wave) * 6));
    if (k <= 0) continue;
    ctx.globalAlpha = k * dim * (0.85 + 0.15 * Math.sin(t * 2 + win.x));
    ctx.fillStyle = win.color;
    ctx.fillRect(win.x, win.y, win.w, win.h);
  }
  ctx.globalAlpha = 1;

  if (lit <= 0) return;
  ctx.globalCompositeOperation = "lighter";
  for (const b of sky.bulbs) {
    const k = clamp((lit - b.wave) * 5);
    if (k <= 0) continue;
    // A slow chase, the way real strings run.
    const chase = 0.55 + 0.45 * Math.sin(t * 3.2 - b.y * 0.25 + b.phase * 0.2);
    const a = k * chase * dim;
    ctx.globalAlpha = a;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x - 0.8, b.y - 0.8, 1.8, 1.8);
    stamp(ctx, glow(b.color), b.x, b.y, 9, a * 0.5);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  drag: number;
  gravity: number;
  /** Draws as a streak along its velocity rather than a dot. */
  streak?: boolean;
  /** Flicker out at end of life, the way crackling stars do. */
  twinkle?: boolean;
}

export function stepParticles(list: Particle[], dt: number) {
  let n = 0;
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    p.life -= dt;
    if (p.life <= 0) continue;
    const d = damp(p.drag, dt);
    p.vx *= d;
    p.vy = p.vy * d + p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    list[n++] = p;
  }
  list.length = n;
}

export function drawParticles(ctx: CanvasRenderingContext2D, list: Particle[], glowScale = 5) {
  ctx.globalCompositeOperation = "lighter";
  for (const p of list) {
    const k = p.life / p.max;
    let a = Math.min(1, k * 1.6);
    if (p.twinkle && k < 0.45) a *= Math.random() < 0.5 ? 0.15 : 1;
    if (p.streak) {
      ctx.globalAlpha = a;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
      ctx.stroke();
    } else {
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    if (glowScale > 0) stamp(ctx, glow(p.color), p.x, p.y, p.size * glowScale, a * 0.45);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

// ---------------------------------------------------------------------------
// Fireworks (diya-chain finale; reusable)
// ---------------------------------------------------------------------------

export const FIREWORK_COLORS = ["#ffd27a", "#ff8a3d", "#ff5fa2", "#7dff9b", "#7ae7ff", "#c49bff", "#fff3d6"];

export type BurstKind = "peony" | "willow" | "ring" | "chrysanthemum";

export function burst(
  out: Particle[],
  x: number,
  y: number,
  kind: BurstKind,
  color: string,
  scale: number,
  rand: () => number = Math.random,
) {
  const alt = FIREWORK_COLORS[Math.floor(rand() * FIREWORK_COLORS.length)];
  if (kind === "ring") {
    const n = 64;
    const tilt = rand() * Math.PI;
    const squash = 0.35 + rand() * 0.4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const lx = Math.cos(a) * 190 * scale;
      const ly = Math.sin(a) * 190 * scale * squash;
      out.push({
        x,
        y,
        vx: lx * Math.cos(tilt) - ly * Math.sin(tilt),
        vy: lx * Math.sin(tilt) + ly * Math.cos(tilt),
        life: 1.5 + rand() * 0.4,
        max: 1.9,
        color: i % 2 ? color : alt,
        size: 2.2,
        drag: 0.965,
        gravity: 40,
      });
    }
    return;
  }
  const n = kind === "willow" ? 90 : kind === "chrysanthemum" ? 130 : 100;
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    // sqrt-ish distribution so the shell reads as a sphere, not a disc.
    const s = (kind === "willow" ? 150 : 230) * scale * (0.55 + 0.45 * Math.sqrt(rand()));
    const max =
      kind === "willow" ? 2.6 + rand() * 0.8 : kind === "chrysanthemum" ? 1.6 + rand() * 0.5 : 1.3 + rand() * 0.5;
    out.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: max,
      max,
      color: kind === "willow" ? (rand() < 0.8 ? "#ffcf6e" : "#fff3d6") : rand() < 0.75 ? color : alt,
      size: kind === "willow" ? 1.8 : 2.2,
      drag: kind === "willow" ? 0.95 : 0.968,
      gravity: kind === "willow" ? 55 : 45,
      streak: kind === "chrysanthemum",
      twinkle: kind !== "chrysanthemum",
    });
  }
}
