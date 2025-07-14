/**
 * @file drop-transition.ts
 *
 * Transition effect where tiles are dropped off-screen.
 */

import { Transition } from '../transition'

const amplitude = 100

export class DropTransition extends Transition {
  static { Transition.register('drop', () => new DropTransition()) }

  public static tileOffset = 0 // checked in tile-group-gfx-helper.ts

  protected reset(): void {
    DropTransition.tileOffset = 0
  }

  protected _cover(t0: number, t1: number): void {
    DropTransition.tileOffset = -t1 * amplitude
  }

  protected _uncover(t0: number, t1: number): void {
    DropTransition.tileOffset = -(1 - t1) * amplitude
  }

  public cleanupCover(): void {
    DropTransition.tileOffset = -amplitude
  }

  public cleanupUncover(): void {
    DropTransition.tileOffset = 0
  }
}
