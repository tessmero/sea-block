/**
 * @file drop-transition.ts
 *
 * Transition effect where tiles are dropped off-screen.
 *
 * Static properties are checked in tile-group-gfx-helper.
 */

import { GridAnimation } from 'gfx/grid-anims/grid-animation'
import { Transition } from '../transition'

export class DropTransition extends Transition {
  static { Transition.register('drop', () => new DropTransition()) }

  // add offset just before a tile is rendered tile-group-gfx-helper.ts
  public getExtraPipelineStep() {
    return ({ current, tileIndex }) => {
      let transitionOffset = 0
      if (DropTransition.gridAnim) {
        const tileAnim = DropTransition.gridAnim.getTileValue(tileIndex, DropTransition.t)
        transitionOffset = 500 * _dampedAnim(1 - tileAnim, 1)
      }
      current.yOffset = transitionOffset
      return current
    }
  }

  public static t = 0 // time 0-1 for GridAnimation

  // assigned in Transition.create -> reset
  public static gridAnim: GridAnimation

  protected reset(): void {
    DropTransition.gridAnim = GridAnimation.create('random-sweep', this.terrain.grid)
    DropTransition.t = 0
  }

  public _hide(t0: number, t1: number): void {
    DropTransition.t = t1
  }

  public _show(t0: number, t1: number): void {
    DropTransition.t = 1 - t1
  }

  public cleanupHide(): void {
    DropTransition.t = 1
  }

  public cleanupShow(): void {
    DropTransition.t = 0
  }
}

function _dampedAnim(time: number, duration: number): number {
  if (time > duration) {
    return 0
  }
  const t = Math.min(time / duration, 1) // Normalize to [0,1]
  const progress = 1 - Math.pow(1 - t, 4)
  const axisVal = (1 - progress)
  return axisVal
}
