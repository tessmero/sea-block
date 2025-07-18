/**
 * @file grid-anims.test.ts
 *
 * Assert that grid animations are visually satisfying.
 */

// correct
import * as fs from 'fs'
import * as path from 'path'
import assert from 'assert'
import { GridAnimation } from '../../src/gfx/grid-anims/grid-animation'
import { GRID_ANIM_NAMES } from '../../src/imp-names'
import { IndexedGrid } from '../../src/core/grid-logic/indexed-grid'

// include source files (populate registry for GridAnimation.create)
const animsDir = path.join(__dirname, '../../src/gfx/grid-anims')
fs.readdirSync(animsDir).forEach((f) => {
  require(path.join(animsDir, f)) // eslint-disable-line @typescript-eslint/no-require-imports
})

const w = 10
const h = 10
const grid = new IndexedGrid(w, h)

const eps = 1e-3 // delta where two values are considered the same
const minUniqueCount = 4 // minimum number of unique values

GRID_ANIM_NAMES.forEach((name) => {
  const instance = GridAnimation.create(name, grid)

  describe(`${name} grid animation for ${grid.width}x${grid.depth} grid`, function () {
    it('has heterogeneous halfway-state', function () {
      const uniqueVals = new Set()
      for (const tile of grid.tileIndices) {
        const rawVal = instance.getTileValue(tile, 0.5) // value at halfway
        const uval = Math.round(rawVal / eps) // value for purposes of uniqueness
        uniqueVals.add(uval)
      }

      assert(uniqueVals.size > minUniqueCount,
        `${name} grid animation should have at least ${minUniqueCount} distinct 
        tile values at halfway point, but it only has ${uniqueVals.size}:
        ${JSON.stringify([...uniqueVals].map(v => (v as number) * eps))}`)
    })

    // check for assertions defined by subclass
    const registered = GridAnimation._registry[name].assertions
    assert('maxSpeed' in registered,
      `grid animation ${name} should provide a maxSpeed assertion when registering`)

    if ('allAtStart' in registered) {
      const expected = registered.allAtStart
      it(`has starting values matching the asserted starting value (${expected})`, function () {
        for (const tile of grid.tileIndices) {
          const val = instance.getTileValue(tile, 0)
          assert.equal(val, expected,
            `grid animation ${name} has wrong starting value at tile ${JSON.stringify(tile)}`,
          )
        }
      })
    }

    if ('allAtEnd' in registered) {
      const expected = registered.allAtEnd
      it(`has ending values matching the asserted ending value (${expected})`, function () {
        for (const tile of grid.tileIndices) {
          const val = instance.getTileValue(tile, 1)
          assert.equal(val, expected,
            `grid animation ${name} has wrong ending value at tile ${JSON.stringify(tile)}`,
          )
        }
      })
    }

    if ('minSpeed' in registered || 'maxSpeed' in registered) {
      const minSpeed: number = registered.minSpeed || 0
      const maxSpeed = registered.maxSpeed
      const nSpeedIntervals = 10
      const dt = 1 / (nSpeedIntervals)

      it(`has acceptable tile-change speeds through ${nSpeedIntervals} sub-intervals`, function () {
        for (let i = 0; i < nSpeedIntervals; i++) {
          const t0 = i * dt
          const t1 = t0 + dt
          for (const tile of grid.tileIndices) {
            const val0 = instance.getTileValue(tile, t0)
            const val1 = instance.getTileValue(tile, t1)

            if ((val0 === 0 && val1 === 0) || (val0 === 1 && val1 === 1)) {
              // tile is exempt from speed check for this interval
              continue
            }

            const speed = Math.abs((val1 - val0) / dt)

            if (minSpeed && val0 !== 0 && val1 !== 0 && val0 !== 1 && val1 !== 1) {
              assert(speed >= minSpeed,
                `grid animation ${name} is too slow in interval ${t0}-${t1} at tile ${JSON.stringify(tile)}
                minimum speed is ${minSpeed}, but has speed ${speed}`,
              )
            }

            assert(speed <= maxSpeed,
              `grid animation ${name} is too fast in interval ${t0}-${t1} at tile ${JSON.stringify(tile)}
                maximum speed is ${maxSpeed}, but has speed ${speed}`,
            )
          }
        }
      })
    }
  })
})
