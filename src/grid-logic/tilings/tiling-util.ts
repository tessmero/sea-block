/**
 * @file tiling-util.ts
 *
 * Helper to lookup tiling subclass by name.
 */

import { HexTiling } from './hex-tiling'
import { SquareTiling } from './square-tiling'

const impls = {
  square: SquareTiling,
  hex: HexTiling,
}

export function getTiling(type: string) {
  const TilingClass = impls[type]
  return new TilingClass()
}
