/**
 * @file tilings.test.ts
 *
 * Unit tests for grid tilings.
 */

import { equal, ok } from 'assert'
import { getTiling } from './tiling-util'

type XZ = { x: number, z: number }

// assert grid indices match
function expectMatch(idx1: XZ, idx2: XZ) {
  equal(idx1.x, idx2.x)
  equal(idx1.z, idx2.z)
}

// assert positions are nearby
function expectClose(a: XZ, b: XZ, epsilon = 1) {
  ok(
    Math.abs(a.x - b.x) < epsilon,
    `x not close: ${a.x} vs ${b.x}`,
  )
  ok(
    Math.abs(a.z - b.z) < epsilon,
    `z not close: ${a.z} vs ${b.z}`,
  )
}

const tilings = [
  'square',
  'hex',
]

tilings.forEach((name) => {
  const tiling = getTiling(name)

  describe(
    `${name} consistency`,
    function () {
      const edgeCases = [
        { x: 0, z: 0 },
        { x: 10.5, z: -3.2 },
        { x: -15.7, z: 42.1 },
        { x: 0.001, z: -0.001 },
      ]

      it(
        'round-trip: position -> index -> position -> index (randomized)',
        function () {
          for (let i = 0; i < 100; i++) {
            const x = Math.random() * 200 - 100
            const z = Math.random() * 200 - 100

            const idx1 = tiling.positionToIndex(x, z)
            const pos = tiling.indexToPosition(idx1.x, idx1.z)
            const idx2 = tiling.positionToIndex(pos.x, pos.z)

            expectMatch(idx1, idx2)
          }
        },
      )

      edgeCases.forEach(({ x, z }, i) => {
        it(
          `edge case #${i}: round-trip indices`,
          function () {
            const idx1 = tiling.positionToIndex(x, z)
            const pos = tiling.indexToPosition(idx1.x, idx1.z)
            const idx2 = tiling.positionToIndex(pos.x, pos.z)

            expectMatch(idx1, idx2)
          },
        )
      })

      it(
        'position -> index -> position is close to original',
        function () {
          const original = { x: 17.3,
            z: -8.6 }
          const idx = tiling.positionToIndex(original.x, original.z)
          const restored = tiling.indexToPosition(idx.x, idx.z)

          expectClose(original, restored)
        },
      )
    },
  )
})
