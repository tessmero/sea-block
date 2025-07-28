/**
 * @file flat-transition.ts
 *
 * Transition using only the front canvas.
 *
 * Refers to a grid animation and only
 * redraws tiles that are actively changing.
 */

import { TILING_NAMES } from 'imp-names'
import type { TileIndex } from '../../core/grid-logic/indexed-grid'
import { TiledGrid } from '../../core/grid-logic/tiled-grid'
import { Tiling } from '../../core/grid-logic/tilings/tiling'
import { randChoice } from '../../util/rng'
import { GridAnimation } from '../grid-anims/grid-animation'
import { Transition } from '../transition'
import { fillPolygon } from './pixel-tiles-gfx-helper'

const viewPad = 50
const padOffset = -viewPad / 2

const targetChunkSize = 10
const maxChunks = 1000
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

  public hideColor: [number, number, number] = [0, 0, 0]

  // chunk grid in units of big pixels
  private chunkSize = targetChunkSize
  private chunkScale = 1

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

  // // completely clear/fill front layer
  // public cleanupHide(): void {
  //   const { ctx, w, h } = this.layeredViewport
  //   const [r, g, b] = this.hideColor
  //   console.log( `flat cleanup hide rgb(${r},${g},${b})`)
  //   ctx.fillStyle = `rgb(${r},${g},${b})`// 'black'
  //   ctx.fillRect(0, 0, w, h)
  // }

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
    this.chunkSize = Math.max(targetChunkSize, Math.ceil(Math.sqrt(w * h / maxChunks)))

    // integer drawing scale
    this.chunkScale = Math.max(1, Math.round(this.chunkSize / targetChunkSize))

    // console.log(`chunk scale ${this.chunkScale}`)
    const widthInChunks = Math.ceil(w / this.chunkSize)
    const heightInChunks = Math.ceil(h / this.chunkSize)

    // compute new grid animation
    this.chunkGrid = new TiledGrid(
      widthInChunks, heightInChunks,
      Tiling.create(randChoice(TILING_NAMES)),
    )

    this.hideAnim = GridAnimation.create(
      Transition.isFirstUncover
        ? 'flat-sweep'
        : randChoice(['flat-sweep', 'radial-sweep', 'random-sweep'] as const),
      // randChoice(['radial-sweep'] as const),
      this.chunkGrid,
    )
    this.showAnim = GridAnimation.create(
      Transition.isFirstUncover
        ? 'flat-sweep'
        : randChoice(['flat-sweep', 'radial-sweep', 'random-sweep'] as const),
      this.chunkGrid,
    )

    return this.chunkSize
  }

  private* getChangedChunks(anim: number): Generator<Chunk> {
    for (const tileIndex of this.chunkGrid.tileIndices) {
      const { i } = tileIndex
      const oldValue = chunkBuffer[i]

      const shouldUseHideAnim = this.isHiding
      const gridAnim = shouldUseHideAnim ? this.hideAnim : this.showAnim
      const newValue = gridAnim.getTileValue(tileIndex, anim)

      if (oldValue !== newValue) {
        yield { tileIndex, value: newValue }
      }

      chunkBuffer[i] = newValue
    }
  }

  private isHiding = true

  public _hide(t0: number, t1: number) {
    // const { ctx } = this.layeredViewport

    this.isHiding = true
    this.fillChangedTiles(t0, t1, this.hideColor)
  }

  public _show(t0: number, t1: number) {
    const { ctx } = this.layeredViewport

    // start erasing with fill operations
    ctx.globalCompositeOperation = 'destination-out'

    this.isHiding = false
    this.fillChangedTiles(t0, t1)

    // restore normal drawing mode
    ctx.globalCompositeOperation = 'source-over'
  }

  private fillChangedTiles(t0: number, t1: number, color?: [number, number, number]) {
    const chunkSize = this.pickChunkSize()
    const { ctx } = this.layeredViewport
    let _count = 0
    for (const { tileIndex, value } of this.getChangedChunks(t1)) {
      const { x, z } = tileIndex
      const tileShape = this.chunkGrid.tiling.shapes[this.chunkGrid.tiling.getShapeIndex(x, z)]

      _count++
      const filledSize = chunkSize * (value)

      const tilePos = this.chunkGrid.tiling.indexToPosition(x, z)
      fillPolygon({ ctx,
        x: Math.floor(tilePos.x * chunkSize + padOffset),
        y: Math.floor(tilePos.z * chunkSize + padOffset),
        scale: filledSize,
        chunkScale: this.chunkScale,
        shape: tileShape,
      }, color)
    }
  }
}

// // DEBUG
// function setDebugText(msg) {
//   debugOverlay.textContent = msg
// }
// const debugOverlay = document.createElement('div')
// debugOverlay.id = 'debug-overlay'
// Object.assign(debugOverlay.style, {
//   position: 'fixed',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   zIndex: '99999',
//   background: 'rgba(0,0,0,0.85)',
//   color: '#fff',
//   padding: '16px 30px',
//   borderRadius: '8px',
//   boxShadow: '0 2px 18px rgba(0,0,0,0.3)',
//   fontFamily: 'monospace',
//   fontSize: '1.1rem',
//   pointerEvents: 'none',
//   textAlign: 'center',
//   maxWidth: '90vw',
//   maxHeight: '80vh',
//   overflow: 'auto',
// })
// debugOverlay.textContent = 'Debug: Everything loaded correctly!'
// document.body.appendChild(debugOverlay)
