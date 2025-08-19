/**
 * @file render-chess-2d-board.test.ts
 *
 * Test rendering 2d chess board images.
 */

import { createCanvas } from 'canvas'
import { drawFlatView } from '../../src/games/chess/gfx/chess-2d-gfx-helper'
import { assertNotAntialiased, saveTestImage } from './gfx-test-util'
import { mockChess } from '../util/chess-test-util'
import { Chess } from '../../src/games/chess/chess-helper'

type RGB = [number, number, number]

const expectedPallette: Array<RGB> = [
  [225, 226, 239], [193, 194, 207], // (off-white) base checkered tile fill,border
  [209, 187, 158], [167, 146, 119], // (tan) base checkered tile
  [129, 226, 143], [113, 194, 127], // (light green) valid move checkered tile
  [65, 187, 110], [55, 146, 71], // (dark green) valid move checkered tile
  [0, 0, 0], // (black) piece icon (public/images/icons/chess)
  [127, 89, 63], // (brown) treasure chest (public/images/icons/chess)
  [128, 128, 128], // (gray) treasure chest
]

let chess: Chess
let canvas

describe('Chess 2D Graphics', function () {
  before(async function () {
    chess = await mockChess(5, 5, 'square')
    canvas = createCanvas(16 * 5, 16 * 5)
  })

  it(`generates non-antialiased flat chess world image`, function () {
    drawFlatView(canvas, chess)

    // save image file for debugging
    saveTestImage(canvas, `chess-2d-board`)

    // // // dbug actual colors
    // const pallette = extractPalette(canvas)
    // console.log(JSON.stringify(pallette))

    // assert pixels have expected colors
    assertNotAntialiased(canvas, { expectedPallette })
  })
})
