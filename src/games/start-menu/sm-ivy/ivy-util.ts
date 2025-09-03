/**
 * @file ivy-util.ts
 *
 * Start menu ivy animation utility functions.
 */

import { Vector2 } from 'three'

// const pi = Math.PI
// const twopi = 2 * pi
// const pio2 = pi / 2
// const pio4 = pi / 4

const _bezierVectors = Array.from({ length: 1000 }, () => new Vector2())
let _vvi = 0
function getBezierVector(): Vector2 {
  _vvi = (_vvi + 1) % _bezierVectors.length
  return _bezierVectors[_vvi]
}

export function bezier(points: Array<Vector2>, r: number) {
  if (points.length === 1) return points[0]
  const ps: Array<Vector2> = []
  for (let i = 1; i < points.length; i++) {
    ps.push(getBezierVector().lerpVectors(points[i - 1], points[i], r))
  }
  return bezier(ps, r)
}

export function shuffle(array) {
  let currentIndex = array.length, randomIndex
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]]
  }
  return array
}

// const vDummy = new Vector2()
export function v(x: number, y: number, target?: Vector2): Vector2 {
  const writeTo = target ?? new Vector2()
  writeTo.set(x, y)
  return writeTo
}
/**
 * Returns a random number in [a, b).
 */

export function randRange(a: number, b: number): number {
  return a + (b - a) * Math.random()
}
