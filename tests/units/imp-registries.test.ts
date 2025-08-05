/**
 * @file imp-registries.test.ts
 *
 * Assert that all named implementations are registered with base classes.
 */

import { flushSourceModules, populateRegistry } from '../../tools/util'
flushSourceModules()

import assert from 'assert'
import {
  CONFIGURABLE, GAME, GENERATOR,
  GRID_ANIM, GUI, ImpManifest, TILING, TRANSITION,
} from '../../src/imp-names'
import { Game } from '../../src/games/game'
import { Tiling } from '../../src/core/grid-logic/tilings/tiling'
import { TerrainGenerator } from '../../src/generators/terrain-generator'
import { Transition } from '../../src/gfx/transition'
import { GridAnimation } from '../../src/gfx/grid-anims/grid-animation'
import { Configurable } from '../../src/configs/configurable'
import { Gui } from '../../src/guis/gui'

const specs = [
  ['Game', Game, GAME],
  ['Gui', Gui, GUI],
  ['Tiling', Tiling, TILING],
  ['TerrainGenerator', TerrainGenerator, GENERATOR],
  ['Transition', Transition, TRANSITION],
  ['Configurable', Configurable, CONFIGURABLE],
  ['GridAnimation', GridAnimation, GRID_ANIM],
] as const satisfies ReadonlyArray<
  [string, { _registry }, ImpManifest]
>
for (const [_name, _BaseClass, manifest] of specs) {
  populateRegistry(manifest)
}

describe('Implementation Registration', async function () {
  for (const [baseClassName, BaseClass, manifest] of specs) {
    describe(baseClassName, function () {
      it(`defines static _registry`, function () {
        assert('_registry' in BaseClass,
          `base class ${baseClassName} should define static _registry`)
      })

      for (const name of manifest.NAMES) {
        it(`has registered "${name}" ${baseClassName} implementation`, function () {
          let factory
          if ((['Game', 'Gui', 'GridAnimation']).includes(baseClassName)) {
            // registered with multiple properties
            factory = BaseClass._registry[name].factory
          }
          else {
            // registered with just factory
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
