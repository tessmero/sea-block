/**
 * @file ivy-triangle.ts
 *
 * Triangle pattern generator for Ivy, ported from to ts from tesmmero/ivy source.
 */

import { v } from '../ivy-util'
import { Scaffold } from '../math/ivy-scaffold'
import { Vine } from '../math/ivy-vine'
import { smIvy } from '../sm-ivy'

export function trianglePattern() {
  smIvy.allScaffolds = []
  const dy = 0.09
  const dx = 0.1
  for (let x = 0; x < 1; x += dx) {
    let iy = 0
    for (let y = 0; y < 1; y += dy) {
      const ox = (iy % 2) ? 0 : dx / 2
      iy += 1

      smIvy.allScaffolds.push(new Scaffold(v(x + ox, y), v(x + ox + dx, y)))
      smIvy.allScaffolds.push(new Scaffold(v(x + ox, y), v(x + ox + dx / 2, y + dy)))
      smIvy.allScaffolds.push(new Scaffold(v(x + ox, y), v(x + ox - dx / 2, y + dy)))
    }
  }
  const s = smIvy.allScaffolds[Math.floor(smIvy.allScaffolds.length / 2)]
  smIvy.allVines = [new Vine(s, 0, 0.2)]
}
