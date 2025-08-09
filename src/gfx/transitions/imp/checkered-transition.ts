/**
 * @file checkered-transition.ts
 *
 * Square-tiled flat transition with two alternating colors.
 */

import { SQUARE_TILING_SHAPES, SquareTiling } from 'core/grid-logic/tilings/square-tiling'
import { SsdTransition } from 'gfx/transitions/imp/ssd-transition'
import { Transition } from 'gfx/transitions/transition'
import type { SweepSegment } from './flat-transition-segments'
import type { SeaBlock } from 'sea-block'
type RGB = [number, number, number]

export class ChessTransition extends SsdTransition {
  static { Transition.register('checkered', () => new ChessTransition() as unknown as Transition) }

  protected reset(context: SeaBlock): void {
    super.reset(context)
    this.ssdShow = []
    this.ssdFinalShow = Transition.create('flat', context)
  }

  protected buildSsdHideSegments() {
    const result = super.buildSsdHideSegments()

    return [
      {
        ...result[0],
        t0: 0.4,
        t1: 0.6,
        tiling: checkeredTiling,
        colors: ['#D1BB9E', '#E1E2EF'],
      } satisfies SweepSegment,
      {
        ...result.at(-1) as SweepSegment,
        t0: 0.6,
        t1: 1,
      } satisfies SweepSegment,
    ]
  }
}

// unregistered square tiling that technically has two alternating tile shapes
class CheckeredTiling extends SquareTiling {
  public constructor() {
    super()
  }

  getShapeIndex(x: number, z: number) {
    return Math.abs((x + z) % 2)
  }

  shapes = [SQUARE_TILING_SHAPES[0], SQUARE_TILING_SHAPES[0]]
}
const checkeredTiling = new CheckeredTiling()
