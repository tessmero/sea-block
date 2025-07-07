/**
 * @file tilings-list.ts
 *
 * Helper to lookup tiling subclass by name.
 */

import { HexTiling } from './hex-tiling'
import { OctagonTiling } from './octagon-tiling'
import { SquareTiling } from './square-tiling'
import type { Tiling } from './tiling'
import { TriangleTiling } from './triangle-tiling'

export const allTilings = {
  triangle: TriangleTiling,
  square: SquareTiling,
  hex: HexTiling,
  octagon: OctagonTiling,
} as const satisfies Record<string, typeof Tiling>

export function getTiling(type: keyof typeof allTilings) {
  const TilingClass = allTilings[type]
  return new TilingClass()
}
