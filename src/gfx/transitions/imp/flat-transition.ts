/**
 * @file flat-transition.ts
 *
 * Transition using only the front canvas.
 *
 * Refers to a grid animation and only
 * redraws tiles that are actively changing.
 */

import { TileIndex } from 'core/grid-logic/indexed-grid'
import { TILING } from 'imp-names'
import { Transition } from '../transition'
import { TiledGrid } from 'core/grid-logic/tiled-grid'
import { Tiling } from 'core/grid-logic/tilings/tiling'
import { randChoice } from 'util/rng'
import { GridAnimation } from 'gfx/grid-anims/grid-animation'
import { fillPolygon, getTempImageset } from 'gfx/2d/pixel-tiles-gfx-helper'

const viewPad = 50
const padOffset = -viewPad / 2

const targetChunkSize = 10
const maxChunks = 1500

const nBuffers = 10 // max number of active transitions
const allChunkBuffers = Array.from({ length: nBuffers }).map(() => new Float32Array(maxChunks))
let indexOfBuffer = 0
function getNewChunkBuffer() {
  const result = allChunkBuffers[indexOfBuffer]
  indexOfBuffer = (indexOfBuffer + 1) % allChunkBuffers.length
  return result
}

type Chunk = {

  // integer coordinates in grid
  tileIndex: TileIndex

  // fraction filled
  value: number
}

type RGB = [number, number, number]

export class FlatTransition extends Transition {
  static { Transition.register('flat', () => new FlatTransition()) }

  private lastWidth = 0
  private lastHeight = 0

  public hideColors: [RGB, RGB] = [[0, 0, 0], [0, 0, 0]]

  // chunk grid in units of big pixels
  private chunkBuffer = getNewChunkBuffer()
  private chunkSize = targetChunkSize
  private chunkScale = 1

  // assigned in Transition.create -> reset -> pickChunkSize
  private widthInChunks!: number
  private heightInChunks!: number
  private hideGrid!: TiledGrid
  private showGrid!: TiledGrid
  private chunkGrid!: TiledGrid // either hideGrid or showGrid
  private hideAnim!: GridAnimation
  private showAnim!: GridAnimation
  private hideImageset!: Array<CanvasImageSource> // temp buffer per shape index
  private showImageset!: Array<CanvasImageSource>
  private imageset!: Array<CanvasImageSource> // either hideImageset or showImageset

  public tiling?: Tiling // override random tiling

  reset() {
    // console.log('flat transition reset')
    this.pickChunkSize()
    this.chunkBuffer.fill(0)
    this.lastWidth = 0
    this.lastHeight = 0
  }

  protected pickTiling(): Tiling {
    return this.tiling || Tiling.create(randChoice(TILING.NAMES))
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
    // let { w, h } = this.layeredViewport
    let w = Math.ceil(window.screen.width * this.layeredViewport.pixelRatio)
    let h = Math.ceil(window.screen.height * this.layeredViewport.pixelRatio)
    w += viewPad
    h += viewPad
    return { w, h }
  }

  // get chunk size for current screen shape
  private pickChunkSize(): number {
    const { w, h } = this._getPaddedDims()
    if (w === this.lastWidth && h === this.lastHeight) {
      return this.chunkSize // screen shape unchanged since last check
    }
    this.lastWidth = w
    this.lastHeight = h

    // update chunk size
    this.chunkSize = targetChunkSize// Math.max(targetChunkSize, Math.ceil(Math.sqrt(w * h / maxChunks)))

    // integer drawing scale
    this.chunkScale = 1// Math.max(1, Math.round(this.chunkSize / targetChunkSize))

    // console.log(`chunk scale ${this.chunkScale}`)
    this.widthInChunks = Math.ceil(w / this.chunkSize)
    this.heightInChunks = Math.ceil(h / this.chunkSize)

    // pick random animation to hide current scene
    this.hideGrid = new TiledGrid(
      this.widthInChunks, this.heightInChunks,
      this.pickTiling(),
    )
    const hideAnimName = Transition.isFirstUncover
      ? 'flat-sweep'
      : randChoice(['flat-sweep', 'radial-sweep', 'random-sweep'] as const)
    this.hideAnim = GridAnimation.create(hideAnimName, this.hideGrid)
    this.hideImageset = getTempImageset(this.hideGrid.tiling, this.hideColors)

    this.chunkGrid = this.hideGrid
    this.imageset = this.hideImageset

    return this.chunkSize
  }

  private* getChangedChunks(anim: number): Generator<Chunk> {
    for (const tileIndex of this.chunkGrid.tileIndices) {
      const { i } = tileIndex
      const oldValue = this.chunkBuffer[i]

      const shouldUseHideAnim = this.isHiding
      const gridAnim = shouldUseHideAnim ? this.hideAnim : this.showAnim
      const newValue = gridAnim.getTileValue(tileIndex, anim)

      if (oldValue !== newValue) {
        yield { tileIndex, value: newValue }
      }

      this.chunkBuffer[i] = newValue
    }
  }

  public isHiding = true

  public _hide(t0: number, t1: number) {
    // const { ctx } = this.layeredViewport

    this.isHiding = true
    this.fillChangedTiles(t0, t1)
  }

  public _show(t0: number, t1: number) {
    const { ctx } = this.layeredViewport

    // start erasing with fill operations
    ctx.globalCompositeOperation = 'destination-out'

    if (this.isHiding) {
    // pick random animation to reveal next scene
      // console.log('flat transition computing show grid')
      this.showGrid = new TiledGrid(
        this.widthInChunks, this.heightInChunks,
        this.pickTiling(),
      )
      const showAnimName = Transition.isFirstUncover
        ? 'flat-sweep'
        : randChoice(['flat-sweep', 'radial-sweep', 'random-sweep'] as const)
      this.showAnim = GridAnimation.create(showAnimName, this.showGrid)
      this.showImageset = getTempImageset(
        this.showGrid.tiling,
        [[0, 0, 0], [0, 0, 0]], // (black) color doesn't matter
      )

      this.chunkBuffer.fill(0)
      this.chunkGrid = this.showGrid
      this.imageset = this.showImageset
    }

    this.isHiding = false
    this.fillChangedTiles(t0, t1)

    // restore normal drawing mode
    ctx.globalCompositeOperation = 'source-over'
  }

  private fillChangedTiles(_t0: number, t1: number) {
    const chunkSize = this.pickChunkSize()
    const { ctx } = this.layeredViewport
    let _count = 0
    for (const { tileIndex, value } of this.getChangedChunks(t1)) {
      const { x, z } = tileIndex
      const shapeIndex = this.chunkGrid.tiling.getShapeIndex(x, z)
      const tileShape = this.chunkGrid.tiling.shapes[shapeIndex]
      const tempBuffer = this.imageset[shapeIndex]

      _count++

      const tilePos = this.chunkGrid.tiling.indexToPosition(x, z)
      fillPolygon({ ctx,
        x: Math.floor(tilePos.x * chunkSize + padOffset),
        y: Math.floor(tilePos.z * chunkSize + padOffset),
        scale: value,
        chunkScale: this.chunkScale,
        shape: tileShape,
      }, tempBuffer)
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
