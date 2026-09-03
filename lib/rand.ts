// Deterministic randomness for card decoration.
//
// Calling Math.random() during render produces different values on the server
// and the client, which is a hydration mismatch. It also means a card looks
// different every visit. Seed from the card id instead: the layout becomes
// stable, reproducible, and hydration-safe.

/** Small, fast, well-distributed 32-bit PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a. Turns a card id (or any string) into a 32-bit seed. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Build `count` deterministic pseudo-random tuples from a seed string.
 * Call inside useMemo so the array is created once per card, never per render.
 */
export function seededSeries(
  seed: string,
  count: number,
  valuesPerItem = 4,
): number[][] {
  const next = mulberry32(hashString(seed));
  const out: number[][] = [];
  for (let i = 0; i < count; i++) {
    const row: number[] = [];
    for (let j = 0; j < valuesPerItem; j++) row.push(next());
    out.push(row);
  }
  return out;
}
