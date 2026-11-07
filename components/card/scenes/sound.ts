// Every sound in the Diwali scenes, synthesised — no audio files to ship,
// license, or wait on over a festival-night mobile connection.
//
// Nothing plays until `unlock()` runs inside a user gesture (browsers enforce
// this anyway), and every method is a silent no-op before that or while muted,
// so scenes call these freely without checking.

type Filter = BiquadFilterType;

export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private hiss: { gain: GainNode; filter: BiquadFilterNode } | null = null;
  private drone: { gain: GainNode; nodes: AudioScheduledSourceNode[] } | null = null;
  private muted = false;

  get ready() {
    return this.ctx !== null && !this.muted;
  }

  /** Call from a pointerdown/keydown handler. Safe to call repeatedly. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 6;
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.8;
    master.connect(comp).connect(ctx.destination);

    const len = ctx.sampleRate * 2;
    const noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.master = master;
    this.noise = noise;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  /** Fade everything out — the scene is handing over to the letter. */
  fadeOut(seconds = 0.8) {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, seconds / 4);
  }

  dispose() {
    const ctx = this.ctx;
    this.ctx = null;
    this.hiss = null;
    this.drone = null;
    if (ctx) setTimeout(() => void ctx.close(), 1200);
  }

  // -------------------------------------------------------------------------
  // Primitives
  // -------------------------------------------------------------------------

  private noiseBurst(o: {
    at?: number;
    dur: number;
    type: Filter;
    f0: number;
    f1?: number;
    q?: number;
    gain: number;
    attack?: number;
  }) {
    const { ctx, master, noise } = this;
    if (!ctx || !master || !noise || this.muted) return;
    const t = ctx.currentTime + (o.at ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = o.type;
    filter.Q.value = o.q ?? 1;
    filter.frequency.setValueAtTime(o.f0, t);
    if (o.f1) filter.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    const g = ctx.createGain();
    const attack = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(filter).connect(g).connect(master);
    src.start(t, Math.random() * 1.5);
    src.stop(t + o.dur + 0.05);
  }

  private tone(o: {
    at?: number;
    dur: number;
    type?: OscillatorType;
    f0: number;
    f1?: number;
    gain: number;
    attack?: number;
  }) {
    const { ctx, master } = this;
    if (!ctx || !master || this.muted) return;
    const t = ctx.currentTime + (o.at ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain, t + (o.attack ?? 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  // -------------------------------------------------------------------------
  // The vocabulary
  // -------------------------------------------------------------------------

  /** A wick catching: a soft breathy whoomp. */
  ignite() {
    this.noiseBurst({ dur: 0.45, type: "bandpass", f0: 500, f1: 2600, q: 0.8, gain: 0.35, attack: 0.03 });
    this.tone({ dur: 0.25, f0: 120, f1: 60, gain: 0.25 });
    this.crackle(4, 0.3, 0.12);
  }

  /** Dry pops — sparklers, crackling stars, embers. */
  crackle(count: number, spread: number, gain = 0.2) {
    for (let i = 0; i < count; i++) {
      this.noiseBurst({
        at: Math.random() * spread,
        dur: 0.015 + Math.random() * 0.035,
        type: "highpass",
        f0: 2500 + Math.random() * 3500,
        gain: gain * (0.4 + Math.random() * 0.8),
        attack: 0.001,
      });
    }
  }

  /** A rocket going up. Returns nothing; pair with `boom` at burst time. */
  launch() {
    this.tone({ dur: 1.0, f0: 500 + Math.random() * 200, f1: 1700, gain: 0.04, attack: 0.05 });
    this.noiseBurst({ dur: 0.9, type: "highpass", f0: 3000, f1: 6000, gain: 0.08, attack: 0.05 });
  }

  boom(size = 1) {
    this.noiseBurst({ dur: 1.8, type: "lowpass", f0: 1600, f1: 90, gain: 0.7 * size, attack: 0.004 });
    this.tone({ dur: 0.9, f0: 70, f1: 32, gain: 0.5 * size });
    this.crackle(Math.round(26 * size), 1.6, 0.14);
  }

  /** A temple ghanti. Inharmonic partials are what make it a bell. */
  bell(freq = 880, gain = 0.16, at = 0) {
    const partials: [number, number][] = [
      [1, 1],
      [2.76, 0.5],
      [5.4, 0.25],
      [8.93, 0.12],
    ];
    for (const [ratio, g] of partials) {
      this.tone({ at, dur: 2.6 / Math.sqrt(ratio), f0: freq * ratio, gain: gain * g, attack: 0.004 });
    }
  }

  /** A rising pentatonic run of bells: the "it's done" moment. */
  chime() {
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    scale.forEach((f, i) => this.bell(f, 0.11, i * 0.11));
  }

  whoosh() {
    this.noiseBurst({ dur: 0.7, type: "bandpass", f0: 250, f1: 1400, q: 1.2, gain: 0.22, attack: 0.15 });
  }

  /**
   * A continuous filtered-noise bed: the sparkler's fizz, or powder pouring.
   * `level` 0 silences it without tearing the graph down.
   */
  setHiss(level: number, freq = 5000) {
    const { ctx, master, noise } = this;
    if (!ctx || !master || !noise) return;
    if (!this.hiss) {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(filter).connect(gain).connect(master);
      src.start();
      this.hiss = { gain, filter };
    }
    const t = ctx.currentTime;
    this.hiss.filter.frequency.setTargetAtTime(freq, t, 0.05);
    this.hiss.gain.gain.setTargetAtTime(this.muted ? 0 : level * 0.35, t, 0.06);
  }

  /** A soft tanpura-like Sa–Pa drone under the whole scene. */
  startDrone() {
    const { ctx, master } = this;
    if (!ctx || !master || this.drone) return;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.05, ctx.currentTime, 1.5);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.connect(gain).connect(master);

    const nodes: AudioScheduledSourceNode[] = [];
    for (const [f, detune] of [
      [130.81, -4],
      [130.81, 5],
      [196, 0],
      [261.63, 3],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = f;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = 0.25;
      osc.connect(g).connect(filter);
      osc.start();
      nodes.push(osc);
    }
    // The slow swell of a tanpura's jawari, roughly.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.18;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 380;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    nodes.push(lfo);

    this.drone = { gain, nodes };
  }
}
