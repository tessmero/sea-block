/**
 * @file ivy-twig.ts
 *
 * Ivy Twig class, ported from to ts from tesmmero/ivy source.
 */

import { Vector2 } from 'three'
import { smIvyConstants } from '../sm-ivy'
import { randRange, bezier } from '../ivy-util'
import { Leaf } from './ivy-leaf'

const _twigVectors = Array.from({ length: 100000 }, () => new Vector2())
let _vvi = 0
function getTwigVector(): Vector2 {
  // return new Vector2()
  _vvi = (_vvi + 1) % _twigVectors.length
  return _twigVectors[_vvi]
}

// loose twig sticking out of Vine
export class Twig {
  readonly a = getTwigVector()
  readonly b = getTwigVector()
  readonly c = getTwigVector()
  infront: boolean

  nSegs: number
  growthDuration: number
  t: number
  pt: number

  constructor(p: Vector2, angle: number, infront: boolean) {
    this.infront = infront
    const len = randRange(...smIvyConstants.twigLen)

    // pick bezier curve points using v() and Vector2
    this.a.copy(p)
    this.b.set(
      p.x + Math.cos(angle) * (len / 2) + Math.cos(angle + Math.PI / 2) * randRange(-len, len),
      p.y + Math.sin(angle) * (len / 2) + Math.sin(angle + Math.PI / 2) * randRange(-len, len),
    )
    this.c.set(
      p.x + Math.cos(angle) * len,
      p.y + Math.sin(angle) * len,
    )

    this.nSegs = Math.floor(len * 1e3)
    this.growthDuration = len / smIvyConstants.growthSpeed
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
    if (Math.random() < smIvyConstants.leafRate) {
      const angle = Math.atan2(this.c.y - this.b.y, this.c.x - this.b.x)
      return [new Leaf(this.b, angle, this.infront)]
    }
    return []
  }

  draw(g: CanvasRenderingContext2D) {
    const nSegs = this.nSegs
    const start = Math.floor(nSegs * this.pt / this.growthDuration)
    const stop = Math.floor(nSegs * this.t / this.growthDuration)

    // draw subsegment
    for (let i = start; (i < stop) && (i < nSegs); i++) {
      const p = bezier([this.a, this.b, this.c], i / nSegs)
      // draw circle
      g.beginPath()
      g.moveTo(p.x, p.y)
      g.arc(p.x, p.y, smIvyConstants.vineThickness / 2, 0, 2 * Math.PI)
      g.fill()
    }
    return []
  }
}
