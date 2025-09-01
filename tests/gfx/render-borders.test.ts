/**
 * @file render-borders.test.ts
 *
 * Test rendering various gui element borders at different dimensions.
 */

import { createCanvas } from 'canvas'
import { assertNotAntialiased, inspectAssetImage, saveTestImage } from './gfx-test-util'
import { BUTTON_VARIANTS } from '../../src/gfx/2d/element-imageset-builder'
import { BUTTON_STATES } from '../../src/guis/gui'
import { ImageAssetUrl } from '../../src/gfx/2d/image-asset-urls'
import { drawExpandedBorder } from '../../src/gfx/2d/border-expander'
import { getImage } from '../../src/gfx/2d/image-asset-loader'

// expanded rectangle shapes to test
const testDims = [
  [16, 16], [16, 50], [57, 16], [40, 40], [17, 19],
]

// prepare one canvas for each shape
const testCanvases = testDims.map(([w, h]) => {
  const canvas = createCanvas(w, h) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const ctx = canvas.getContext('2d')
  return { canvas, ctx }
})

describe('gui element borders', function () {
  for (const variant of BUTTON_VARIANTS) {
    for (const state of BUTTON_STATES) {
      const borderSrc: ImageAssetUrl = `borders/${variant}-${state}.png`
      let expectedPallette

      describe(`border variant ${variant} (${state})`, function () {
        it(`has limited pallette in raw asset ${borderSrc}`, function () {
          const { canvas, pallette } = inspectAssetImage(getImage(borderSrc))
          expectedPallette = pallette
          assertNotAntialiased(canvas, { expectedPallette })
        })

        for (const [i, [w, h]] of testDims.entries()) {
          const { canvas, ctx } = testCanvases[i]

          it(`renders ${w}x${h} expansion with matching pallette`, function () {
            ctx.clearRect(0, 0, w, h)
            drawExpandedBorder(ctx, getImage(borderSrc), w, h)

            // save image file for debugging
            saveTestImage(canvas, `borders/${w}x${h}-${variant}-${state}`)

            // assert that pixels have the same colors as the raw asset
            assertNotAntialiased(canvas, { expectedPallette })
          })
        }
      })
    }
  }
})
