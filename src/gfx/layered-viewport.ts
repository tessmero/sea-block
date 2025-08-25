/**
 * @file layered-viewport.ts
 *
 * Manages a two full-viewport html canvas elements.
 * Handles pixel ratio and keeps pixels precisely alligned between layers.
 *
 * The back canvas shows the three.js scene.
 * The front canvas is mostly transparent,
 * shows transition effects and 2D gui elements.
 */

import { WebGLRenderer } from 'three'
import { gfxConfig } from '../configs/gfx-config'
import type { Rectangle } from '../util/layout-parser'
import type { SeaBlock } from '../sea-block'
import { resetFrontLayer } from './2d/flat-gui-gfx-helper'

// can only be constructed once
let didConstruct = false
let didInit = false

export class LayeredViewport {
  // members assigned in init(), called in main.ts
  public backCanvas!: HTMLCanvasElement
  public midCanvas!: HTMLCanvasElement
  public frontCanvas!: HTMLCanvasElement

  public backRenderer!: WebGLRenderer // main 2d context
  public ctx!: CanvasRenderingContext2D // main 2d context
  public frontCtx!: CanvasRenderingContext2D // transition effect overlay
  public pixelRatio!: number // convert pixels to big pixels
  public w!: number // width in big pixels
  public h!: number // height in big pixels
  public screenRectangle!: Rectangle // 0,0,w,h

  constructor() {
    if (didConstruct) {
      throw new Error('LayeredViewport constructed multiple times')
    }
    didConstruct = true
  }

  // called when viewport changes shape (sea-block.ts)`
  handleResize(context: SeaBlock) {
    this.pixelRatio = window.devicePixelRatio / gfxConfig.flatConfig.pixelScale
    this.w = window.innerWidth * this.pixelRatio
    this.h = window.innerHeight * this.pixelRatio
    this.screenRectangle = { x: 0, y: 0, w: this.w, h: this.h }

    this.backRenderer.setSize(
      window.innerWidth,
      window.innerHeight,
    )

    if ((typeof context.currentGameName === 'undefined') || context.currentGameName === 'splash-screen') {
      // special size for pixels in background of start/launch button
      this.backRenderer.setPixelRatio(window.devicePixelRatio / 6)
    }
    else {
      this.backRenderer.setPixelRatio(this.pixelRatio) // normal pixel size
    }

    this.midCanvas.width = this.w
    this.midCanvas.height = this.h
    this.frontCanvas.width = this.w
    this.frontCanvas.height = this.h
    resetFrontLayer(context)

    // if( context.transition ){

    // }
  }

  init(context: SeaBlock) {
    if (didInit) {
      throw new Error('LayeredViewport initialized multiple times')
    }
    didInit = true

    this.backCanvas = document.getElementById('backCanvas') as HTMLCanvasElement
    this.midCanvas = document.getElementById('midCanvas') as HTMLCanvasElement
    this.frontCanvas = document.getElementById('frontCanvas') as HTMLCanvasElement

    // three.js Renderer for back canvas
    this.backRenderer = new WebGLRenderer({
      canvas: this.backCanvas,
      antialias: true,
    })

    // 2D graphics context for front canvas
    this.ctx = this.midCanvas.getContext('2d') as CanvasRenderingContext2D
    this.frontCtx = this.frontCanvas.getContext('2d') as CanvasRenderingContext2D

    this.handleResize(context)
  }

  // // called after launch to switch to renering sharp pixels
  // resetRenderer(antialias = false) {
  //   this.backRenderer = new WebGLRenderer({
  //     canvas: this.backCanvas,
  //     antialias: antialias,
  //   })
  // }
}
