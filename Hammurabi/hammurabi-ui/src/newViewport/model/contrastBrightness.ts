export const DEFAULT = 50;
export const MIN = 0;
export const MAX = 100;
export const SENSITIVITY = 10;

export function clamp(v: number): number {
  return Math.min(Math.max(v, MIN), MAX);
}

function normalize(v: number, min: number, max: number): number {
  return (v - min) / (max - min);
}

export function toFactor(v: number): number {
  if (v < DEFAULT) {
    // The lower range (min - default) equals to a factor of 0 - 1.
    return normalize(v, MIN, DEFAULT);
  }

  // The upper range (default - max) equals to a factor of 1 - infinity.
  return 1.0 / (1.0 - Math.min(0.999999, normalize(v, DEFAULT, MAX)));
}
