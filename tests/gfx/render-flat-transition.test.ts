/**
 * @file render-flat-transition.test.ts
 *
 * Render 2d transition effect and assert that pixels are not antialiased.
 */

import { assertNotAntialiased, saveTestImage } from './gfx-test-util'

import { TILING, TRANSITION, GRID_ANIM } from '../../src/imp-names'
import { populateRegistry } from '../../tools/util'
// flushSourceModules()
populateRegistry(TILING)
populateRegistry(GRID_ANIM)
populateRegistry(TRANSITION)

import { Transition } from '../../src/gfx/transitions/transition'
import { SeaBlock } from '../../src/sea-block'

import { Tiling } from '../../src/core/grid-logic/tilings/tiling'
import { createCanvas } from 'canvas'
import { FlatTransition } from '../../src/gfx/transitions/imp/flat-transition'

// import * as THREE from 'three'
// import { randChoice } from '../../src/util/rng'
// import { gfxConfig } from '../../src/configs/gfx-config'
// import { LayeredViewport } from '../../src/gfx/layered-viewport'
// import { buildScene } from '../../src/gfx/3d/scene'
// import { TiledGrid } from '../../src/core/grid-logic/tiled-grid'
// import { TileGroup } from '../../src/core/groups/tile-group'

const { width, height } = window.screen // tests/fixtures.ts
const canvas = createCanvas(width, height)
const frontCtx = canvas.getContext('2d') as any // eslint-disable-line @typescript-eslint/no-explicit-any

// mock seablock
const seaBlock = {
  layeredViewport: {
    pixelRatio: 1,
    frontCtx,
  },
  config: {
    flatConfig: {
      transitionMode: 'enabled',
    },
  },
} as unknown as SeaBlock

describe('Flat Transition', function () {
  for (const tiling of TILING.NAMES) {
    it(`generates non-antialiased ${tiling} tiling image`, function () {
      Transition.isLaunching = false
      Transition.isFirstUncover = false
      FlatTransition.forceFlatSweep = true
      const transition = Transition.create('flat', seaBlock, {
        t0: 0,
        t1: 1,
        colors: ['black', 'black'],
        tiling: Tiling.create(tiling),
      })

      frontCtx.fillStyle = 'white'
      frontCtx.fillRect(0, 0, width, height)

      // cover screen partway
      transition.update(0.2 * transition.totalDuration)

      // // emulate anti-aliased pixel to make sure test can fail
      // ctx.fillStyle = 'gray'
      // ctx.fillRect(width / 2, height / 2, 1, 1)

      // save image file for debugging
      saveTestImage(canvas, `${tiling}-transition`)

      // assert that pixels are black and white
      assertNotAntialiased(canvas, { expectedPallette: ['black', 'white'] })
    })
  }
})
