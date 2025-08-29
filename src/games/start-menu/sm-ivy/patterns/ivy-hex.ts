/**
 * @file ivy-hex.ts
 *
 * Hex pattern generator for Ivy, ported from to ts from tesmmero/ivy source.
 */

import { v } from '../ivy-util'
import { Scaffold } from '../math/ivy-scaffold'
import { Vine } from '../math/ivy-vine'
import { smIvy } from '../sm-ivy'

export function hexPattern() {
  smIvy.allScaffolds = []

  let dy = 0.09
  let dx = 0.1
  const scale = 0.7
  dx *= scale
  dy *= scale
  let ix = 0

  for (let x = 0; x < 1; x += dx) {
    let iy = 0
    for (let y = 0; y < 1; y += dy) {
      const ox = (iy % 2) ? 0 : dx / 2

      const val = ((ix + (iy % 2)) % 3)

      if (val === 0) {
        smIvy.allScaffolds.push(new Scaffold(v(x + ox, y), v(x + ox + dx, y)))
      }

      if (val === 0) {
        smIvy.allScaffolds.push(new Scaffold(v(x + ox, y), v(x + ox - dx / 2, y + dy)))
      }
      if (val === 1) {
        smIvy.allScaffolds.push(new Scaffold(v(x + ox, y), v(x + ox + dx / 2, y + dy)))
      }

      iy += 1
    }

    ix += 1
  }

  // Mark edge scaffolds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const s of smIvy.allScaffolds) {
    minX = Math.min(minX, s.a.x, s.b.x)
    maxX = Math.max(maxX, s.a.x, s.b.x)
    minY = Math.min(minY, s.a.y, s.b.y)
    maxY = Math.max(maxY, s.a.y, s.b.y)
  }
  for (const s of smIvy.allScaffolds) {
    if (
      s.a.x === minX || s.b.x === minX
      || s.a.x === maxX || s.b.x === maxX
      || s.a.y === minY || s.b.y === minY
      || s.a.y === maxY || s.b.y === maxY
    ) {
      s.isEdge = true
    }
  }

  smIvy.allVines = []
  for (const scaffold of smIvy.allScaffolds) {
    if (scaffold.isEdge) {
      smIvy.allVines.push(new Vine(
        scaffold,
        0, 0.2,
      ))
      smIvy.allVines.push(new Vine(
        scaffold,
        1, 0.8,
      ))
    }
  }
  // for (let i = 0; i < 50; i++) {
  //   smIvy.allVines.push(new Vine(
  //     smIvy.allScaffolds.at(-i) as Scaffold,
  //     0, 0.2,
  //   ))
  //   smIvy.allVines.push(new Vine(
  //     smIvy.allScaffolds[i],
  //     0, 0.2,
  //   ))
  // }
}
