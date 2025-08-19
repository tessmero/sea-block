/**
 * @file chess-repaint-effect.ts
 *
 * Animation for chess help diagrams.
 * Cursors continuoutsly loop over pixels in imagedata.
 * when pixelmatches detectColor, fill that pixel on the canvas with fillColor.
 *
 */

const speed = 1e1 // pixels to update per ms

type RGB = [number, number, number]

type Cursor = {
  readonly detectColor: RGB
  readonly fillColor?: RGB
  currentIndex: number
}

const cursors: Array<Cursor> = [
  {
    // turn border white
    detectColor: [113, 194, 127], // light green border
    fillColor: [255, 255, 255],
    currentIndex: -1000,
  },
  {
    // turn border white
    detectColor: [55, 146, 71], // dark green border
    fillColor: [255, 255, 255],
    currentIndex: -1000,
  },
  {
    // restore border
    detectColor: [113, 194, 127], // light green border
    currentIndex: -2000,
  },
  {
    // restore border
    detectColor: [55, 146, 71], // dark green border
    currentIndex: -2000,
  },
]
const startIndices = cursors.map(cur => cur.currentIndex)

let canvas: OffscreenCanvas
let ctx: OffscreenCanvasRenderingContext2D
let imageData: ImageData

export function startRepaintEffect(targetCanvas: OffscreenCanvas) {
  canvas = targetCanvas
  const { width, height } = canvas
  ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D
  imageData = ctx.getImageData(0, 0, width, height)

  for (let i = 0; i < cursors.length; i++) {
    cursors[i].currentIndex = startIndices[i]
  }
}

export function updateRepaintEffect(dt: number) {
  const { width } = canvas
  const data = imageData.data
  const nPixels = Math.floor(dt * speed)
  // console.log('update repaint effect', nPixels)
  for (let step = 0; step < nPixels; step++) {
    for (const cursor of cursors) {
      const idx = cursor.currentIndex
      const pixelOffset = idx * 4
      if (pixelOffset > 0 && pixelOffset + 2 < data.length) {
        const [r, g, b] = [data[pixelOffset], data[pixelOffset + 1], data[pixelOffset + 2]]
        const [dr, dg, db] = cursor.detectColor
        if (r === dr && g === dg && b === db) {
          const x = idx % width
          const y = Math.floor(idx / width)
          const [fr, fg, fb] = cursor.fillColor || cursor.detectColor
          ctx.fillStyle = `rgb(${fr},${fg},${fb})`
          ctx.fillRect(x, y, 1, 1)
        }
      }
      cursor.currentIndex = (idx + 1)// % (width * height)
    }
  }
}
