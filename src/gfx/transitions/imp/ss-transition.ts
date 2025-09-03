/**
 * @file ss-transition.ts
 *
 * Sweep-sweep transition, same as flat transition but the screen
 * is covered multiple times with different colors.
 */

import type { SeaBlock } from 'sea-block'
import { Transition } from '../transition'
import type { BufferedSegment } from '../flat-transition-segments'
import { buildHideSegments, buildShowSegments, buildSweepTransition } from '../flat-transition-segments'

// planned sweeps (halfway screen is fully black)
const hideSegments = buildHideSegments() // overlapping during first half
const showSegments = buildShowSegments() // overlapping during second half

export class SsTransition extends Transition {
  static { Transition.register('ss', () => new SsTransition()) }

  totalDuration = 3000 // ms

  // assigned in create -> reset`
  context!: SeaBlock
  ssdHide!: Array<BufferedSegment> // corresponds with hideSegments
  ssdShow!: Array<BufferedSegment>

  protected reset(context: SeaBlock): void {
    this.context = context
    if (Transition.isFirstUncover) {
      // first hide does not have colors
      this.ssdHide = showSegments.map(seg => buildSweepTransition(this.context, seg))
    }
    else {
      this.ssdHide = this.buildSsHideSegments().map(seg => buildSweepTransition(context, seg))
    }
  }

  protected buildSsHideSegments() {
    return hideSegments
  }

  public _hide(t0: number, t1: number): void {
    for (const [_i, seg] of this.ssdHide.entries()) {
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

  private _initSsShow() {
    if (!this.ssdShow) {
      this.ssdShow = showSegments.map(seg => buildSweepTransition(this.context, seg))
    }
    // if (!this.ssdFinalShow) {
    //   this.ssdFinalShow = Transition.create('drop', this.context)
    // }
  }

  public _show(t0: number, t1: number): void {
    this._initSsShow()

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
  }
}
