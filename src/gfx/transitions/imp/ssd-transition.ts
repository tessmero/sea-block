/**
 * @file ssd-transition.ts
 *
 * Sweep-sweep-drop combo transition.
 * - Sweeps screen like start half of flat-transition,
 * - repeats the sweep with different colors,
 * - and reveals new scene with end of drop-transition.
 */

import type { SeaBlock } from 'sea-block'
import { Transition } from '../transition'
import type { SweepSegment } from './flat-transition-segments'
import { buildHideSegments, buildShowSegments } from './flat-transition-segments'

// planned sweeps (halfway screen is fully black)
const hideSegments = buildHideSegments() // overlapping during first half
const showSegments = buildShowSegments() // overlapping during second half

interface BufferedSegment extends SweepSegment {
  transition: Transition
  isFinished: boolean
}

type RGB = [number, number, number]

function buildSweepTransition(context: SeaBlock, seg: SweepSegment): BufferedSegment {
  const transition = Transition.create(
    'flat', context, seg,
  )
  return { ...seg, transition, isFinished: false }
}

export class SsdTransition extends Transition {
  static { Transition.register('ssd', () => new SsdTransition()) }

  // assigned in create -> reset
  context!: SeaBlock
  ssdHide!: Array<BufferedSegment> // corresponds with hideSegments
  ssdShow!: Array<BufferedSegment>
  ssdFinalShow!: Transition

  protected reset(context: SeaBlock): void {
    this.context = context
    this.ssdHide = this.buildSsdHideSegments().map(seg => buildSweepTransition(context, seg))
  }

  protected buildSsdHideSegments() {
    return hideSegments
  }

  public _hide(t0: number, t1: number): void {
    for (const [i, seg] of this.ssdHide.entries()) {
      if (seg.isFinished) {
        continue
      }

      if (t1 < seg.t0) {
        continue // hasn't started yet
      }

      if (t0 < seg.t1 || t1 > seg.t0) {
        const t0InSegment = Math.max(0, Math.min(1, (t0 - seg.t0) / (seg.t1 - seg.t0)))
        const t1InSegment = Math.max(0, Math.min(1, (t1 - seg.t0) / (seg.t1 - seg.t0)))
        seg.transition._hide(t0InSegment, t1InSegment)
        // console.log(`hide subtransition with index ${i}, (${t0InSegment.toFixed(2)}-${t1InSegment.toFixed(2)})`)
      }

      if (t0 > seg.t1) {
        seg.isFinished = true
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
    if (this.ssdShow.length > 0) this.ssdShow[0].transition.cleanupShow() // clear front layer
    this.ssdFinalShow.cleanupShow() // unwarp terrain
  }

  private _initSsdShow() {
    if (!this.ssdShow) {
      this.ssdShow = showSegments.map(seg => buildSweepTransition(this.context, seg))
    }
    if (!this.ssdFinalShow) {
      this.ssdFinalShow = Transition.create('drop', this.context)
    }
  }

  public _show(t0: number, t1: number): void {
    this._initSsdShow()

    const n = showSegments.length
    for (const [i, seg] of this.ssdShow.entries()) {
      if (seg.isFinished) {
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
          seg.transition._show(t0InSegment, t1InSegment)
        }
        else {
          seg.transition._hide(t0InSegment, t1InSegment)
        }
        // console.log(`hide subtransition with index ${i}, (${t0InSegment.toFixed(2)}-${t1InSegment.toFixed(2)})`)
      }

      if (t0 > seg.t1) {
        seg.isFinished = true
        // console.log(`finished segment ${i} at ${t0}`)
      }
    }

    if (t1 > 0.5) {
      this.ssdFinalShow._show(Math.max(0, (t0 - 0.5) * 2), Math.min(1, (t1 - 0.5) * 2))
    }
  }
}
