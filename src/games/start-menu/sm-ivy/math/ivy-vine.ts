/**
 * @file ivy-vine.ts
 *
 * Ivy Vine class, ported from to ts from tesmmero/ivy source.
 */

import { Vector2 } from 'three'
import { smIvy, smIvyConstants } from '../sm-ivy'
import { randRange } from '../ivy-util'
import { Twig } from './ivy-twig'
import type { Scaffold } from './ivy-scaffold'
import { lerp } from 'three/src/math/MathUtils.js'

const dummy = new Vector2()

const _vineVectors = Array.from({ length: 1000 }, () => new Vector2())
let _vvi = 0
function getVineVector(): Vector2 {
  // return new Vector2()
  _vvi = (_vvi + 1) % _vineVectors.length
  return _vineVectors[_vvi]
}

const drawDummyA = new Vector2()
const drawDummyB = new Vector2()

// ivy branch segment wrapping around a scaffold
const pi = Math.PI
const twopi = 2 * pi
const pio2 = pi / 2
const pio4 = pi / 4
export class Vine {
  scaffold: Scaffold
  start: number
  stop: number
  reverse: boolean
  reverseHelix: boolean
  startPadding: number
  stopPadding: number
  readonly a = getVineVector()
  readonly prev = getVineVector()
  readonly b = getVineVector()
  readonly d = getVineVector()
  amp: number
  norm: number
  nPeriods: number
  nSegs: number
  growthDuration: number
  t: number
  pt: number

  constructor(
    scaffold: Scaffold,
    start: number, stop: number,
    reverseHelix = false,
    startPadding: number | null = null,
  ) {
    this.scaffold = scaffold
    scaffold.isOccupied = true
    this.start = start
    this.stop = stop
    this.reverse = (stop < start)
    this.reverseHelix = reverseHelix
    if (startPadding === null) startPadding = Math.random() * smIvyConstants.vinePadding
    this.startPadding = startPadding
    this.stopPadding = Math.random() * smIvyConstants.vinePadding

    // Use v() and Vector2 for points
    const a = this.a.lerpVectors(scaffold.a, scaffold.b, start)
    this.prev.copy(a)
    const b = this.b.lerpVectors(scaffold.a, scaffold.b, stop)

    // d = b - a
    const d = this.d.subVectors(b, a)
    const dist = d.length()

    this.amp = smIvy.helix_d / 2
    this.norm = Math.atan2(d.y, d.x) + Math.PI / 2

    const rd = randRange(...smIvyConstants.spiralDensity)
    let n = Math.floor(dist * rd)
    if (n < 1) n = 1
    this.nPeriods = n

    this.nSegs = this.nPeriods * 100

    // compute growth duration
    const h = dist
    const p = h / n
    const hlen = n * Math.sqrt(smIvy.hpid2 + p * p)
    this.growthDuration = hlen / smIvyConstants.growthSpeed
    this.t = 0
    this.pt = 0
  }

  update(dt) {
    this.pt = this.t
    this.t += dt
  }

  isDone() {
    return this.t > this.growthDuration
  }

  // get new vines to extend this one
  // return list of length 1 to grow normally
  // return empty list to stop growing
  getNext(): Array<Vine> {
    // check if there is still space on the current scaffold
    if ((!this.reverse) && (this.stop < 0.8)) {
      // continue on the current scaffold
      let newStop = this.stop + randRange(...smIvyConstants.helixDist)
      if (newStop > 0.8) newStop = 1
      return [new Vine(this.scaffold, this.stop, newStop, this.reverseHelix)]
    }

    // check if there is still space on the current scaffold
    if ((this.reverse) && (this.stop > 0.2)) {
      // continue on the current scaffold
      let newStop = this.stop - randRange(...smIvyConstants.helixDist)
      if (newStop < 0.2) newStop = 0
      return [new Vine(this.scaffold, this.stop, newStop, this.reverseHelix)]
    }

    const result: Array<Vine> = []

    const shouldBranch = (Math.random() < smIvyConstants.branchRate)
    do {
      // look for next scaffold nearby
      const all_s = this.getNextScaffolds(this.b)
      all_s.sort(() => Math.random() - 0.5)

      // grow on new scaffold
      if (all_s.length > 0) {
        const s = all_s.pop()
        if (s) {
        // check if new scaffodl has same orientation as current
          let isRight = this.reverseHelix
          if (Math.abs(s[0].angle - this.scaffold.angle) > 0.1) {
            isRight = !isRight
          }

          if (s[1]) {
            result.push(new Vine(s[0], 0, randRange(...smIvyConstants.helixDist), isRight))
          }
          else {
            result.push(new Vine(s[0], 1, 1 - randRange(...smIvyConstants.helixDist), isRight))
          }
        }
      }
      else {
        break
      }
    } while (shouldBranch)

    return result
  }

  getNextScaffolds(p: Vector2): Array<[Scaffold, boolean]> {
    const mj2 = Math.pow(smIvyConstants.maxJump, 2)
    const result: Array<[Scaffold, boolean]> = []
    smIvy.allScaffolds.forEach((s) => {
      if (s.isOccupied) return

      let d2 = dummy.subVectors(p, s.a).lengthSq()
      if ((d2 < mj2)) {
        result.push([s, true])
      }

      d2 = dummy.subVectors(p, s.b).lengthSq()
      if ((d2 < mj2)) {
        result.push([s, false])
      }
    })
    return result
  }

  draw(g): Array<Vine> {
    const newTwigs: Array<Twig> = []

    const a = this.a
    const b = this.b
    const nSegs = this.nSegs

    const start = Math.floor(nSegs * this.pt / this.growthDuration)
    const stop = Math.floor(nSegs * this.t / this.growthDuration)

    // g.restore()

    // draw vine segment
    for (let i = start; (i < stop) && (i < nSegs); i++) {
      const ang = twopi * i / nSegs * this.nPeriods
      const padding = lerp(this.startPadding, this.stopPadding, i / nSegs)

      // decide whether this should be occluded by scaffold
      const isInFront = (((ang + pio2) % twopi) < pi)
      g.globalCompositeOperation = isInFront ? 'destination-over' : 'source-over'

      // compute point on helix
      let amp = this.amp * Math.sin(ang)
      if (this.reverseHelix) amp *= -1
      amp += Math.sign(amp) * padding
      // va(a, b, t) = lerpVectors(a, b, t); vp(angle, r) = new Vector2(Math.cos(angle) * r, Math.sin(angle) * r)
      const p = drawDummyA
        .lerpVectors(a, b, i / nSegs)
        .add(drawDummyB.set(
          Math.cos(this.norm) * amp,
          Math.sin(this.norm) * amp,
        ))

      // draw
      g.beginPath()
      g.moveTo(this.prev.x, this.prev.y)
      g.lineTo(p.x, p.y)
      g.stroke()
      // }
      // else {
      //   g.beginPath()
      //   g.moveTo(p.x, p.y)
      //   g.arc(p.x, p.y, smIvyConstants.vineThickness / 2, 0, twopi)
      //   g.fill()
      // }

      if (Math.random() < smIvyConstants.twigRate) {
        // add twig to be drawn later
        let angle = this.scaffold.angle + pio2
        if (amp > 0) angle += pi
        angle += randRange(-pio4, pio4)
        newTwigs.push(new Twig(p, angle, isInFront))
      }

      this.prev.copy(p)
    }

    return newTwigs as unknown as Array<Vine>
  }
}
