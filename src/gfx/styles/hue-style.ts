/**
 * @file hue-style.ts
 *
 * Randomized color rotating style.
 */

export function getRandomHueStyle() {
  const offset = randOffset()
  return {
    background: { hue: offset },
    top: { hue: offset },
    sides: { hue: offset, lightness: '50%' },
  }
}

function randOffset(): string {
  const off = 0.3 + Math.random() * 0.3
  if (Math.random() > 0.5) {
    return `-${off.toFixed(3)}`
  }
  return `+${off.toFixed(3)}`
}
