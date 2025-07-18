/**
 * @file flat-transition.ts
 *
 * Transition using only the front canvas.
 *
 * Refers to flat-transition-ga (GridAnimation) and only
 * redraws tiles that are actively changing.
 */

import type { TileIndex } from '../../core/grid-logic/indexed-grid'
import { TiledGrid } from '../../core/grid-logic/tiled-grid'
import type { TileShape } from '../../core/grid-logic/tilings/tiling'
import { Tiling } from '../../core/grid-logic/tilings/tiling'
import { TILING_NAMES } from '../../imp-names'
import { randChoice } from '../../util/rng'
import { GridAnimation } from '../grid-anims/grid-animation'
import { Transition } from '../transition'

const viewPad = 100
const padOffset = -viewPad / 2

const maxChunks = 128
const chunkBuffer = new Float32Array(maxChunks)
type Chunk = {

  // integer coordinates in grid
  tileIndex: TileIndex

  // fraction filled
  value: number
}

let lastWidth = 0
let lastHeight = 0

export class FlatTransition extends Transition {
  static { Transition.register('flat', () => new FlatTransition()) }

  // chunk grid in units of big pixels
  private chunkSize = 10

  // assigned in Transition.create -> reset -> pickChunkSize
  private chunkGrid!: TiledGrid
  private hideAnim!: GridAnimation
  private showAnim!: GridAnimation

  reset() {
    // console.log('flat transition reset')
    this.pickChunkSize()
    chunkBuffer.fill(0)
    lastWidth = 0
    lastHeight = 0
  }

  private _getPaddedDims() {
    let { w, h } = this.layeredViewport
    w += viewPad
    h += viewPad
    return { w, h }
  }

  // get chunk size for current screen shape
  private pickChunkSize(): number {
    const { w, h } = this._getPaddedDims()
    if (w === lastWidth && h === lastHeight) {
      return this.chunkSize // screen shape unchanged since last check
    }
    lastWidth = w
    lastHeight = h

    // update chunk size
    this.chunkSize = Math.ceil(Math.sqrt(w * h / maxChunks))
    const widthInChunks = Math.ceil(w / this.chunkSize)
    const heightInChunks = Math.ceil(h / this.chunkSize)

    // compute new grid animation
    this.chunkGrid = new TiledGrid(
      widthInChunks, heightInChunks,
      Tiling.create(randChoice(TILING_NAMES)),
    )

    this.hideAnim = GridAnimation.create(
      randChoice(['flat-sweep', 'radial-sweep', 'random-sweep'] as const),
      // randChoice(['radial-sweep'] as const),
      this.chunkGrid,
    )
    this.showAnim = GridAnimation.create(
      randChoice(['flat-sweep', 'radial-sweep', 'random-sweep'] as const),
      this.chunkGrid,
    )

    return this.chunkSize
  }

  private* getChangedChunks(anim: number, targetValue: number): Generator<Chunk> {
    for (const tileIndex of this.chunkGrid.tileIndices) {
      const { i } = tileIndex
      const oldValue = chunkBuffer[i]

      const gridAnim = targetValue === 1 ? this.hideAnim : this.showAnim
      let newValue = gridAnim.getTileValue(tileIndex, anim)
      if (targetValue === 0) {
        newValue = 1 - newValue
      }

      if (oldValue !== newValue) {
        yield { tileIndex, value: newValue }
      }

      chunkBuffer[i] = newValue
    }
  }

  public cleanupHide(): void {
    const { ctx, w, h } = this.layeredViewport
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, w, h)
  }

  public cleanupShow(): void {
    const { ctx, w, h } = this.layeredViewport
    ctx.clearRect(0, 0, w, h)
  }

  protected _hide(t0: number, t1: number) {
    const chunkSize = this.pickChunkSize()
    const { ctx } = this.layeredViewport
    ctx.fillStyle = 'black'
    let _count = 0
    for (const { tileIndex, value } of this.getChangedChunks(t1, 1)) {
      const { x, z } = tileIndex
      const tileShape = this.chunkGrid.tiling.shapes[this.chunkGrid.tiling.getShapeIndex(x, z)]

      _count++
      const filledSize = chunkSize * value

      const tilePos = this.chunkGrid.tiling.indexToPosition(x, z)
      this.fillPolygon(ctx,
        tilePos.x * chunkSize + padOffset,
        tilePos.z * chunkSize + padOffset,
        filledSize,
        tileShape)
    }
  }

  protected _show(t0: number, t1: number) {
    const chunkSize = this.pickChunkSize()
    const { ctx } = this.layeredViewport

    // start erasing with fill operations
    ctx.globalCompositeOperation = 'destination-out'

    let _count = 0
    for (const { tileIndex, value } of this.getChangedChunks(t1, 0)) {
      const { x, z } = tileIndex
      const tileShape = this.chunkGrid.tiling.shapes[this.chunkGrid.tiling.getShapeIndex(x, z)]

      _count++
      const filledSize = chunkSize * (1 - value)

      const tilePos = this.chunkGrid.tiling.indexToPosition(x, z)
      this.fillPolygon(ctx,
        tilePos.x * chunkSize,
        tilePos.z * chunkSize,
        filledSize,
        tileShape)
    }

    // restore normal drawing mode
    ctx.globalCompositeOperation = 'source-over'
  }

  private fillPolygon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    tileShape: TileShape,
  ) {
    const { n } = tileShape
    const radius = 1.1 * scale * tileShape.radius
    const angle = tileShape.angle + Math.PI / 2
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const vertAngle = angle + 2 * Math.PI * i / n
      const x = cx + radius * Math.cos(vertAngle)
      const y = cy + radius * Math.sin(vertAngle)
      ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
  }
}

// function _dampedAnim(t: number): number {
//   return 1 - Math.pow(1 - t, 4)
// }
