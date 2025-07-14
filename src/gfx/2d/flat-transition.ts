/**
 * @file flat-transition.ts
 *
 * Simple transition using only the front canvas.
 */

import { Transition } from '../transition'

const maxChunks = 128
const chunkBuffer = new Float32Array(maxChunks)
type Chunk = {

  // integer coordinates in grid
  x: number
  y: number

  // fraction filled
  value: number
}

let lastWidth = 0
let lastHeight = 0

export class FlatTransition extends Transition {
  static { Transition.register('flat', () => new FlatTransition()) }

  // chunk grid in units of big pixels
  private chunkSize = 10
  private maxRadius = 10
  private centerX = 5
  private centerY = 5

  reset() {
    // console.log('flat transition reset')
    chunkBuffer.fill(0)
    lastWidth = 0
    lastHeight = 0
  }

  // get chunk size for current screen shape
  private pickChunkSize(): number {
    const { w, h } = this.layeredViewport
    if (w === lastWidth && h == lastHeight) {
      return this.chunkSize // screen shape unchanged since last check
    }
    lastWidth = w
    lastHeight = h

    // update chunk size
    this.chunkSize = Math.ceil(Math.sqrt(w * h / maxChunks))
    const widthInChunks = Math.ceil(w / this.chunkSize)
    const heightInChunks = Math.ceil(h / this.chunkSize)
    this.centerX = widthInChunks / 2
    this.centerY = heightInChunks / 2
    this.maxRadius = this.chunkSize + Math.hypot(widthInChunks, heightInChunks) / 2
    return this.chunkSize
  }

  private* getChangedChunks(anim: number, targetValue: number): Generator<Chunk> {
    const distSquared = Math.pow(anim * this.maxRadius, 2)
    const innerD2 = distSquared - this.chunkSize

    const s = this.chunkSize
    const cx = this.centerX
    const cy = this.centerY
    const sw = this.layeredViewport.w
    const sh = this.layeredViewport.h
    const w = Math.ceil(sw / s)
    const h = Math.ceil(sh / s)
    let i = 0
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const dx = cx - x
        const dy = cy - y
        const oldValue = chunkBuffer[i]

        // const newValue = (dx * dx + dy * dy) < distSquared ? targetValue : 1 - targetValue
        let newValue
        const d2 = (dx * dx + dy * dy)
        if (d2 > distSquared) {
          // chunk hasn't started
          newValue = 1 - targetValue
        }
        else if (d2 < innerD2) {
          // chunk is finished
          newValue = targetValue
        }
        else {
          // chunk partially finished (sqrt in range 0-1 is fast)
          // const r = Math.sqrt((d2-innerD2)/(distSquared-innerD2))
          const r = ((d2 - innerD2) / (distSquared - innerD2))
          newValue = targetValue === 1 ? 1 - r : r
        }

        if (oldValue !== newValue) {
          yield { x, y, value: newValue }
        }

        chunkBuffer[i++] = newValue
      }
    }
  }

  public cleanupCover(): void {
    const { ctx, w, h } = this.layeredViewport
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, w, h)
  }

  public cleanupUncover(): void {
    const { ctx, w, h } = this.layeredViewport
    ctx.clearRect(0, 0, w, h)
  }

  protected _cover(t0: number, t1: number) {
    // console.log(`cover ${t1}`)
    const chunkSize = this.pickChunkSize()
    const { ctx } = this.layeredViewport
    ctx.fillStyle = 'black'
    let _count = 0
    for (const { x, y, value } of this.getChangedChunks(t1, 1)) {
      _count++
      const filledSize = chunkSize * value
      const offset = (chunkSize - filledSize) / 2
      ctx.fillRect(
        x * chunkSize + offset,
        y * chunkSize + offset,
        filledSize, filledSize)
    }
    // console.log(`  ${_count} changed chunks`)

    // const x0 = Math.floor(t0 * w)
    // const dx = Math.ceil((t1 - t0) * w)
    // ctx.fillRect(x0, 0, dx, h)
  }

  protected _uncover(t0: number, t1: number) {
    // console.log(`uncover ${t1}`)

    const chunkSize = this.pickChunkSize()
    const { ctx } = this.layeredViewport
    // ctx.fillStyle = 'white'
    let _count = 0
    for (const { x, y, value } of this.getChangedChunks(t1, 0)) {
      _count++
      const filledSize = chunkSize * (1 - value)
      const offset = (chunkSize - filledSize) / 2
      ctx.clearRect(
        x * chunkSize + offset,
        y * chunkSize + offset,
        filledSize, filledSize)
    }
    // console.log(`  ${_count} changed chunks`)

    // const x0 = Math.floor(t0 * w)
    // const dx = Math.ceil((t1 - t0) * w)
    // ctx.clearRect(x0, 0, dx, h)
  }
}
