/**
 * @file tiling-util.ts
 *
 * Helper to lookup tiling subclass by name.
 */

import { HexTiling } from './hex-tiling'
import { SquareTiling } from './square-tiling'
import { TriangleTiling } from './triangle-tiling'

const impls = {
  triangle: TriangleTiling,
  square: SquareTiling,
  hex: HexTiling,
}

export function getTiling(type: string) {
  const TilingClass = impls[type]
  return new TilingClass()
}
