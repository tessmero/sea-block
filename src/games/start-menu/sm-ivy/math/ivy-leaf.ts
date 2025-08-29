/**
 * @file ivy-leaf.ts
 *
 * Ivy Leaf class, ported from to ts from tesmmero/ivy source.
 */

import { Vector2 } from 'three'
import { smIvyConstants } from '../sm-ivy'
import { randRange, bezier } from '../ivy-util'

const _leafVectors = Array.from({ length: 100000 }, () => new Vector2())
let _vvi = 0
function getLeafVector(): Vector2 {
  // return new Vector2()
  _vvi = (_vvi + 1) % _leafVectors.length
  return _leafVectors[_vvi]
}

const pi = Math.PI
const twopi = 2 * pi
// const pio2 = pi / 2
// const pio4 = pi / 4

// loose twig sticking out of Vine
export class Leaf {
  readonly a = getLeafVector()
  readonly b = getLeafVector()
  readonly c = getLeafVector()
  infront: boolean
  maxRad: number
  nSegs: number
  growthDuration: number
  t: number
  pt: number

  constructor(p: Vector2, angle: number, infront: boolean) {
    this.infront = infront
    this.maxRad = randRange(...smIvyConstants.leafSize)
    const len = randRange(...smIvyConstants.leafLen)

    // pick bezier curve points using v() and Vector2
    this.a.copy(p)
    this.b.set(
      p.x + Math.cos(angle) * (len / 2) + Math.cos(angle + Math.PI / 2) * randRange(-len / 4, len / 4),
      p.y + Math.sin(angle) * (len / 2) + Math.sin(angle + Math.PI / 2) * randRange(-len / 4, len / 4),
    )
    this.c.set(
      p.x + Math.cos(angle) * len,
      p.y + Math.sin(angle) * len,
    )

    this.nSegs = Math.floor(len * 1e3)
    this.growthDuration = 10 * len / smIvyConstants.growthSpeed
    this.t = 0
    this.pt = 0
  }

  update(dt: number) {
    this.pt = this.t
    this.t += dt
  }

  isDone() {
    return this.t > this.growthDuration
  }

  getNext() {
    return []
  }

  draw(g: CanvasRenderingContext2D) {
    const nSegs = this.nSegs
    const start = Math.floor(nSegs * this.pt / this.growthDuration)
    const stop = Math.floor(nSegs * this.t / this.growthDuration)

    // draw subsegment
    for (let i = start; (i < stop) && (i < nSegs); i++) {
      const p = bezier([this.a, this.b, this.c], i / nSegs)
      let subRad = this.maxRad * Math.sin(Math.PI * i / nSegs)
      if (subRad < (smIvyConstants.vineThickness / 2)) subRad = smIvyConstants.vineThickness / 2
      // draw circle
      g.beginPath()
      g.moveTo(p.x, p.y)
      g.arc(p.x, p.y, subRad, 0, 2 * Math.PI)
      g.fill()

      let rad = this.maxRad * Math.sin(pi * i / nSegs)
      if (rad < (smIvyConstants.vineThickness / 2)) rad = smIvyConstants.vineThickness / 2
      // draw circle
      g.beginPath()
      g.moveTo(p.x, p.y)
      g.arc(p.x, p.y, rad, 0, twopi)
      g.fill()
    }
    return []
  }
}
