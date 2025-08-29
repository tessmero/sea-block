/**
 * @file ivy-scaffold.ts
 *
 * Ivy Scaffold class, ported from to ts from tesmmero/ivy source.
 */

import type { Vector2 } from 'three'

// const pi = Math.PI;
// const twopi = 2 * pi;
// const pio2 = pi / 2;
// const pio4 = pi / 4;

// a static line segment for ivy to wrap around
export class Scaffold {
  a: Vector2
  b: Vector2
  angle: number
  isOccupied = false
  isEdge = false

  constructor(a: Vector2, b: Vector2) {
    this.a = a.clone()
    this.b = b.clone()
    // angle from a to b
    this.angle = Math.atan2(b.y - a.y, b.x - a.x)
  }

  draw(g: CanvasRenderingContext2D) {
    g.moveTo(this.a.x, this.a.y)
    g.lineTo(this.b.x, this.b.y)
  }
}
