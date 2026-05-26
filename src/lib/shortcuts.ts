export const zoomStep = 0.1

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
