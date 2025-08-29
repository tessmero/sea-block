/**
 * @file ivy-square.ts
 *
 * Square pattern generator for Ivy, ported from to ts from tesmmero/ivy source.
 */

import { randRange, v } from '../ivy-util'
import { Scaffold } from '../math/ivy-scaffold'
import { Vine } from '../math/ivy-vine'
import { smIvy } from '../sm-ivy'

export function squarePattern() {
  smIvy.allScaffolds = []
  const dx = 0.1
  const dy = 0.1
  for (let x = 0; x < 1; x += dx) {
    for (let y = 0; y < 1; y += dy) {
      smIvy.allScaffolds.push(new Scaffold(v(x, y), v(x + dx, y)))
      smIvy.allScaffolds.push(new Scaffold(v(x, y), v(x, y + dy)))
    }
  }
  const s = smIvy.allScaffolds[Math.floor(smIvy.allScaffolds.length * randRange(0.48, 0.52))]
  smIvy.allVines = [new Vine(s, 0, 0.2)]
}
