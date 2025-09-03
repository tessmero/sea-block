/**
 * @file ivy-pattern_list.ts
 *
 * Pattern list for Ivy, ported from to ts from tesmmero/ivy source.
 */

import { randRange } from '../ivy-util'
import { hexPattern } from './ivy-hex'

export function doRandomPattern() {
  const allPatterns = [
    // squarePattern,
    hexPattern,
  ]

  allPatterns[Math.floor(randRange(0, allPatterns.length))]()
}
