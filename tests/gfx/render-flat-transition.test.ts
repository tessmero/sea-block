/**
 * @file render-flat-transition.test.ts
 *
 * Render 2d transition effect and assert that pixels are not antialiased.
 */

import path from 'path'
import fs from 'fs'

import { TILING, TRANSITION, GRID_ANIM } from '../../src/imp-names'
import { flushSourceModules, populateRegistry } from '../../tools/util'
flushSourceModules()
populateRegistry(TILING)
populateRegistry(GRID_ANIM)
populateRegistry(TRANSITION)

import { Transition } from '../../src/gfx/transitions/transition'
import { SeaBlock } from '../../src/sea-block'

import { Tiling } from '../../src/core/grid-logic/tilings/tiling'
import { preloadPixelTiles } from '../../src/gfx/2d/pixel-tiles-gfx-helper'
import { createCanvas } from 'canvas'

// import * as THREE from 'three'
// import { randChoice } from '../../src/util/rng'
// import { gfxConfig } from '../../src/configs/gfx-config'
// import { LayeredViewport } from '../../src/gfx/layered-viewport'
// import { buildScene } from '../../src/gfx/3d/scene'
// import { TiledGrid } from '../../src/core/grid-logic/tiled-grid'
// import { TileGroup } from '../../src/core/groups/tile-group'

const { width, height } = window.screen // tests/fixtures.ts
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d') as any // eslint-disable-line @typescript-eslint/no-explicit-any

const seaBlock = {
  layeredViewport: {
    pixelRatio: 1,
    ctx,
  },
} as SeaBlock

describe('Flat Transition', function () {
  for (const tiling of TILING.NAMES) {
    it(`generates non-antialiased ${tiling} tiling image`, async function () {
      await preloadPixelTiles(Tiling.getAllShapes(), 'public/')
      const transition = Transition.create('flat', seaBlock, {
        t0: 0,
        t1: 1,
        colors: ['black', 'black'],
        tiling: Tiling.create(tiling),
      })

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      // cover screen partway
      transition.update(0.4 * transition.totalDuration)

      // // emulate anti-aliased pixel to make sure test can fail
      // ctx.fillStyle = 'gray'
      // ctx.fillRect(width / 2, height / 2, 1, 1)

      // save image file for debugging
      const outFile = path.resolve(__dirname, `test-images/${tiling}-tiling.png`)
      fs.writeFileSync(outFile, canvas.toBuffer('image/png'))

      // assert that pixels are not anti aliased
      const imgData = ctx.getImageData(0, 0, width, height).data
      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i]
        const g = imgData[i + 1]
        const b = imgData[i + 2]
        const a = imgData[i + 3]

        const isWhite = r === 255 && g === 255 && b === 255 && a === 255
        const isBlack = r === 0 && g === 0 && b === 0 && a === 255

        if (!isWhite && !isBlack) {
          throw new Error(`pixel should black or white (not anti-aliased):
            position: ${(i / 4) % width}, ${Math.floor(i / 4 / width)}: 
            color: rgba(${r},${g},${b},${a})`,
          )
        }
      }
    })
  }
})
