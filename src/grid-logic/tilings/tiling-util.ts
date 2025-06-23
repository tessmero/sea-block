/**
 * @file tiling-util.ts
 *
 * Helper to lookup tiling subclass by name.
 */

import { HexTiling } from './hex-tiling'
import { OctagonTiling } from './octagon-tiling'
import { SquareTiling } from './square-tiling'
import { TriangleTiling } from './triangle-tiling'

export const allTilings = {
  triangle: TriangleTiling,
  square: SquareTiling,
  hex: HexTiling,
  octagon: OctagonTiling,
}

export function getTiling(type: string) {
  const TilingClass = allTilings[type]
  return new TilingClass()
}
