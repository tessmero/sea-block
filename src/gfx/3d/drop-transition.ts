/**
 * @file drop-transition.ts
 *
 * Transition effect where tiles are dropped off-screen.
 *
 * Static properties are checked in tile-group-gfx-helper.
 */

import { GridAnimation } from '../grid-anims/grid-animation'
import { Transition } from '../transition'

export class DropTransition extends Transition {
  static { Transition.register('drop', () => new DropTransition()) }

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
