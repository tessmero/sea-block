/**
 * @file imp-registries.test.ts
 *
 * Assert that all named implementations are registered with base classes.
 */
import assert from 'assert'
import { glob } from 'glob'
import {
  CONFIGURABLE_NAMES, GAME_NAMES, GENERATOR_NAMES,
  GRID_ANIM_NAMES, TILING_NAMES, TRANSITION_NAMES,
} from '../../src/imp-names'
import { Game } from '../../src/games/game'
import { Tiling } from '../../src/core/grid-logic/tilings/tiling'
import { TerrainGenerator } from '../../src/generators/terrain-generator'
import { Transition } from '../../src/gfx/transition'
import { GridAnimation } from '../../src/gfx/grid-anims/grid-animation'
import { Configurable } from '../../src/configs/configurable'

// populate registries by loading all implementations' source files
const patterns = [
  '../../src/games/**/*.ts',
  '../../src/grid-logic/tilings/**/*.ts',
  '../../src/generators/**/*.ts',
  '../../src/configs/**/*.ts',
  '../../src/gfx/grid-anims/**/*.ts',

  '../../src/gfx/2d/flat-transition.ts',
  '../../src/gfx/3d/drop-transition.ts',
  '../../src/gfx/ssd-transition.ts',
]
for (const pattern of patterns) {
  const files = glob.sync(pattern, { cwd: __dirname, absolute: true })
  for (const file of files) {
    require(file) // eslint-disable-line @typescript-eslint/no-require-imports
  }
}
const specs = [
  ['Game', Game, GAME_NAMES],
  ['Tiling', Tiling, TILING_NAMES],
  ['TerrainGenerator', TerrainGenerator, GENERATOR_NAMES],
  ['Transition', Transition, TRANSITION_NAMES],
  ['Configurable', Configurable, CONFIGURABLE_NAMES],
  ['GridAnimation', GridAnimation, GRID_ANIM_NAMES],
] as const satisfies ReadonlyArray<
  [string, { _registry }, ReadonlyArray<string>]
>

describe('Implementation Registration', function () {
  for (const [baseClassName, BaseClass, impNames] of specs) {
    describe(baseClassName, function () {
      assert('_registry' in BaseClass,
        `base class ${baseClassName} should define static _registry`)

      for (const name of impNames) {
        it(`has registered "${name}" ${baseClassName} implementation`, function () {
          let factory
          if (baseClassName === 'Game') {
            // registered games have multiple properties
            factory = BaseClass._registry[name].factory
          }
          else if (baseClassName === 'GridAnimation') {
            // registered grid animations have multiple properties
            factory = BaseClass._registry[name].factory
          }
          else {
            // other registries just have factories
            factory = BaseClass._registry[name]
          }

          assert(factory,
            `"${name}" ${baseClassName} should have factory registered`)
          assert(typeof factory === 'function',
            `"${name}" ${baseClassName} registered factory should be a function, 
            but it is a ${typeof factory}: ${JSON.stringify(factory)}`)

          const game = factory()
          assert(game instanceof BaseClass,
            `factory for "${name}" ${baseClassName} should return ${baseClassName} instance`)
        })
      }
    })
  }
})
