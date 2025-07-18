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

// can only be constructed once
let didConstruct = false
let didInit = false

export class LayeredViewport {
  // members assigned in init(), called in main.ts
  public backCanvas!: HTMLCanvasElement
  public frontCanvas!: HTMLCanvasElement
  public backRenderer!: WebGLRenderer
  public ctx!: CanvasRenderingContext2D
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

  // called when viewport changes shape (sea-block.ts)
  handleResize() {
    this.pixelRatio = window.devicePixelRatio / gfxConfig.flatConfig.pixelScale
    this.w = window.innerWidth * this.pixelRatio
    this.h = window.innerHeight * this.pixelRatio
    this.screenRectangle = { x: 0, y: 0, w: this.w, h: this.h }

    this.backRenderer.setSize(
      window.innerWidth,
      window.innerHeight,
    )
    this.backRenderer.setPixelRatio(this.pixelRatio)

    this.frontCanvas.width = this.w
    this.frontCanvas.height = this.h
  }

  init() {
    if (didInit) {
      throw new Error('LayeredViewport initialized multiple times')
    }
    didInit = true

    this.backCanvas = document.getElementById('backCanvas') as HTMLCanvasElement
    this.frontCanvas = document.getElementById('frontCanvas') as HTMLCanvasElement

    // three.js Renderer for back canvas
    this.backRenderer = new WebGLRenderer({
      canvas: this.backCanvas,
      antialias: true,
    })

    // 2D graphics context for front canvas
    this.ctx = this.frontCanvas.getContext('2d') as CanvasRenderingContext2D

    this.handleResize()
  }

  // // called after launch to switch to renering sharp pixels
  // resetRenderer(antialias = false) {
  //   this.backRenderer = new WebGLRenderer({
  //     canvas: this.backCanvas,
  //     antialias: antialias,
  //   })
  // }
}
