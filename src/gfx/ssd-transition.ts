/**
 * @file ssd-transition.ts
 *
 * Sweep-sweep-drop combo transition.
 * - Sweeps screen like start half of flat-transition,
 * - repeats the sweep with different colors,
 * - and reveals new scene with end of drop-transition.
 */

import { Color } from 'three'
import type { SeaBlock } from 'sea-block'
import { Transition } from './transition'
import type { SweepSegment } from './2d/flat-transition-segments'
import { buildHideSegments, buildShowSegments } from './2d/flat-transition-segments'

// planned sweeps (halfway screen is fully black)
const hideSegments = buildHideSegments() // overlapping during first half
const showSegments = buildShowSegments() // overlapping during second half

type BufferedSegment = {
  transition: Transition
  isFinished: boolean
}

function buildSweepTransition(context: SeaBlock, seg: SweepSegment): BufferedSegment {
  const color = new Color(seg.color)
  const transition = Transition.create(
    'flat', context,
    color.toArray() as [number, number, number],
  )
  return { transition, isFinished: false }
}

export class SsdTransition extends Transition {
  static { Transition.register('ssd', () => new SsdTransition()) }

  // assigned in create -> reset
  context!: SeaBlock
  ssdHide!: Array<BufferedSegment> // corresponds with hideSegments
  ssdShow!: Array<BufferedSegment>
  ssdFinalShow!: Transition

  protected reset(context): void {
    this.context = context
    this.ssdHide = hideSegments.map(seg => buildSweepTransition(context, seg))
  }

  public _hide(t0: number, t1: number): void {
    for (const [i, seg] of hideSegments.entries()) {
      const buffered = this.ssdHide[i]
      if (buffered.isFinished) {
        continue
      }

      if (t1 < seg.t0) {
        continue // hasn't started yet
      }

      if (t0 < seg.t1 || t1 > seg.t0) {
        const t0InSegment = Math.max(0, Math.min(1, (t0 - seg.t0) / (seg.t1 - seg.t0)))
        const t1InSegment = Math.max(0, Math.min(1, (t1 - seg.t0) / (seg.t1 - seg.t0)))
        buffered.transition._hide(t0InSegment, t1InSegment)
        // console.log(`hide subtransition with index ${i}, (${t0InSegment.toFixed(2)}-${t1InSegment.toFixed(2)})`)
      }

      if (t0 > seg.t1) {
        buffered.isFinished = true
        // console.log(`finished segment ${i} at ${t0}`)
      }
    }
  }

  public cleanupHide(): void {
    // console.log('ssd cleanup hide black')

    const { ctx, w, h } = this.layeredViewport
    ctx.fillStyle = 'black' // last hide segment color
    ctx.fillRect(0, 0, w, h)

    // make sure terrain is offscreen
    this._initSsdShow()
    this.ssdFinalShow.cleanupHide()
  }

  public cleanupShow(): void {
    this._initSsdShow()
    this.ssdShow[0].transition.cleanupShow() // clear front layer
    this.ssdFinalShow.cleanupShow() // unwarp terrain
  }

  private _initSsdShow() {
    if (!this.ssdShow) {
      this.ssdShow = hideSegments.map(seg => buildSweepTransition(this.context, seg))
    }
    if (!this.ssdFinalShow) {
      this.ssdFinalShow = Transition.create('drop', this.context)
    }
  }

  public _show(t0: number, t1: number): void {
    this._initSsdShow()

    const n = showSegments.length
    for (const [i, seg] of showSegments.entries()) {
      const buffered = this.ssdShow[i]
      if (buffered.isFinished) {
        continue
      }

      if (t1 < seg.t0) {
        continue // hasn't started yet
      }

      if (t0 < seg.t1 || t1 > seg.t0) {
        const t0InSegment = Math.max(0, Math.min(1, (t0 - seg.t0) / (seg.t1 - seg.t0)))
        const t1InSegment = Math.max(0, Math.min(1, (t1 - seg.t0) / (seg.t1 - seg.t0)))

        if (i === (n - 1)) {
          // last sweep reveals back layer
          buffered.transition._show(t0InSegment, t1InSegment)
        }
        else {
          buffered.transition._hide(t0InSegment, t1InSegment)
        }
        // console.log(`hide subtransition with index ${i}, (${t0InSegment.toFixed(2)}-${t1InSegment.toFixed(2)})`)
      }

      if (t0 > seg.t1) {
        buffered.isFinished = true
        // console.log(`finished segment ${i} at ${t0}`)
      }
    }

    if (t1 > 0.5) {
      this.ssdFinalShow._show(Math.max(0, (t0 - 0.5) * 2), Math.min(1, (t1 - 0.5) * 2))
    }
  }
}
