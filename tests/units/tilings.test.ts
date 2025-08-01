/**
 * @file tilings.test.ts
 *
 * Unit tests for grid tilings: round-trip consistency.
 */

import { flushSourceModules, populateRegistry } from '../../tools/util'
flushSourceModules()
import { TILING } from '../../src/imp-names'
populateRegistry(TILING)

import { equal, ok } from 'assert'
import { Tiling } from '../../src/core/grid-logic/tilings/tiling'

interface XZ { x: number, z: number }

function expectMatch(idx1: XZ, idx2: XZ) {
  equal(idx1.x, idx2.x)
  equal(idx1.z, idx2.z)
}

function expectClose(a: XZ, b: XZ, epsilon = 1.5) {
  ok(Math.abs(a.x - b.x) < epsilon, `x not close: ${a.x} vs ${b.x}`)
  ok(Math.abs(a.z - b.z) < epsilon, `z not close: ${a.z} vs ${b.z}`)
}

const testPoints: Array<XZ> = [
  { x: 0, z: 0 },
  { x: 10.5, z: -3.2 },
  { x: -15.7, z: 42.1 },
  { x: 0.001, z: -0.001 },
]
for (let i = 0; i < 100; i++) {
  testPoints.push({
    x: Math.random() * 20000 - 10000,
    z: Math.random() * 20000 - 10000,
  })
}

describe('grid tilings', function () {
  TILING.NAMES.forEach((name) => {
    const tiling = Tiling.create(name)
    describe(`${name} indexing for ${testPoints.length} test points`, function () {
      it('has consistent round-trip: position -> index -> position -> index', function () {
        for (const point of testPoints) {
          const idx = tiling.positionToIndex(point.x, point.z)
          const newPoint = tiling.indexToPosition(idx.x, idx.z)
          const newIdx = tiling.positionToIndex(newPoint.x, newPoint.z)
          expectClose(point, newPoint)
          expectMatch(idx, newIdx)
        }
      })
    })
  })
})
