/**
 * @file ssd-transition.ts
 *
 * Sweep-sweep-drop combo transition.
 * - Sweeps screen like start half of flat-transition,
 * - repeats the sweep with different colors,
 * - then reveals new scene with end of drop-transition.
 */

import type { FlatTransition } from './2d/flat-transition'
import { Transition } from './transition'

export class SsdTransition extends Transition {
  static { Transition.register('ssd', () => new SsdTransition()) }

  // assigned in create -> reset
  ssdHide!: Array<Transition>
  ssdShow!: Array<Transition>

  protected reset(context): void {
    this.ssdHide = [
      Transition.create('flat', context),
      Transition.create('flat', context),
    ]
    this.ssdShow = [
      Transition.create('flat', context),
      Transition.create('drop', context),
    ];

    (this.ssdHide[0] as FlatTransition).hideColor = [0.5, 0.5, 0.5];
    (this.ssdHide[1] as FlatTransition).hideColor = [0, 0, 0]
  }

  public _hide(t0: number, t1: number): void {
    const [first, second] = this.ssdHide
    if (t0 < 0.5) {
      first._hide(Math.max(0, t0 * 2), Math.min(1, t1 * 2))
    }
    if (t1 > 0.5) {
      second._hide(Math.max(0, (t0 - 0.5) * 2), Math.min(1, (t1 - 0.5) * 2))
    }
  }

  public cleanupHide(): void {
    // console.log('ssd cleanup hide black')

    const { ctx, w, h } = this.layeredViewport
    ctx.fillStyle = 'black' // last hide segment color
    ctx.fillRect(0, 0, w, h)

    // make sure terrain is offscreen
    this.ssdShow[1].cleanupHide()
  }

  public _show(t0: number, t1: number): void {
    const [first, second] = this.ssdShow
    if (t0 < 0.5) {
      first._show(Math.max(0, t0 * 2), Math.min(1, t1 * 2))
    }
    if (t1 > 0.5) {
      second._show(Math.max(0, (t0 - 0.5) * 2), Math.min(1, (t1 - 0.5) * 2))
    }
  }
}
