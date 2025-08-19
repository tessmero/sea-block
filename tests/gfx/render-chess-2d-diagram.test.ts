/**
 * @file render-chess-2d-diagram.test.ts
 *
 * Test rendering miniature chess moves diagram.
 */
import { createCanvas } from 'canvas'
import { drawMovesDiagram } from '../../src/games/chess/gfx/chess-help-diagrams'
import { PIECE_NAMES } from '../../src/games/chess/chess-enums'
import { assertNotAntialiased, saveTestImage } from './gfx-test-util'

type RGB = [number, number, number]

const expectedPallette: Array<RGB> = [
  [225, 226, 239], [193, 194, 207], // (off-white) base checkered tile fill,border
  [209, 187, 158], [167, 146, 119], // (tan) base checkered tile
  [129, 226, 143], [113, 194, 127], // (light green) valid move checkered tile
  [65, 187, 110], [55, 146, 71], // (dark green) valid move checkered tile
  [0, 0, 0], // (black) piece icon (public/images/icons/chess)
]

const w = 50
const h = 50
const rectangle = { x: 0, y: 0, w, h }
let canvas
let ctx

for (const piece of PIECE_NAMES) {
  before(async function () {
    canvas = createCanvas(w, h)
    ctx = canvas.getContext('2d')
  })

  it(`generates non-antialiased ${piece} moves diagram`, function () {
    ctx.clearRect(0, 0, w, h)
    drawMovesDiagram(ctx, { piece, rectangle })

    // save image file for debugging
    saveTestImage(canvas, `chess-2d-${piece}-diagram`)

    // // // debug actual colors
    // const pallette = extractPalette(canvas)
    // console.log(JSON.stringify(pallette))

    let expectMissingColors = 0
    if (piece === 'bishop' || piece === 'knight') {
      // expect to be missing one green checkered tile variant
      expectMissingColors = 2
    }

    // assert pixels have expected colors
    assertNotAntialiased(canvas, {
      expectedPallette, expectMissingColors,
    })
  })
}
