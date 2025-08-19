/**
 * @file checkered-transition.ts
 *
 * Square-tiled flat transition with two alternating colors.
 */

import { SQUARE_TILING_SHAPES, SquareTiling } from 'core/grid-logic/tilings/square-tiling'
import { Transition } from 'gfx/transitions/transition'
import type { SweepSegment } from '../flat-transition-segments'
import type { ColorRepresentation } from 'three'
import { SsTransition } from './ss-transition'
// type RGB = [number, number, number]

export class ChessTransition extends SsTransition {
  static { Transition.register('checkered', () => new ChessTransition() as unknown as Transition) }

  protected buildSsHideSegments() {
    return [
      {
        t0: 0,
        t1: 0.6,
        tiling: checkeredTiling,
        colors: pickTransitionColors(),
      } satisfies SweepSegment,
      {
        t0: 0.4,
        t1: 1,
        colors: ['black', 'black'],
      } satisfies SweepSegment,
    ]
  }
}

const allColors = [
  ['#D1BB9E', '#E1E2EF'],
  ['#81E28F', '#E1E2EF'],
  ['#B3CFFF', '#E1E2EF'],
]
function pickTransitionColors() {
  const pair = allColors[Math.floor(Math.random() * allColors.length)]
  return pair as [ColorRepresentation, ColorRepresentation]
}

// unregistered square tiling that technically has two alternating tile shapes
class CheckeredTiling extends SquareTiling {
  // eslint-disable-next-line sb/no-constructor
  public constructor() {
    super()
  }

  getShapeIndex(x: number, z: number) {
    const sx = Math.floor(x / scale)
    const sz = Math.floor(z / scale)
    return Math.abs((sx + sz) % 2)
  }

  shapes = [SQUARE_TILING_SHAPES[0], SQUARE_TILING_SHAPES[0]]
}
const checkeredTiling = new CheckeredTiling()
const scale = 4
