/**
 * @file ivy-setup.ts
 *
 * Setup two buffer and visible canvas for ivy animation.
 * Also handle resizing.
 */
import { gfxConfig } from 'configs/imp/gfx-config'
import { v } from './ivy-util'
import { doRandomPattern } from './patterns/ivy-pattern_list'
import { smIvy } from './sm-ivy'

export function ivySetup() {
  const buffer = document.getElementById('ivyBuffer') as HTMLCanvasElement
  const canvas = document.getElementById('ivyCanvas') as HTMLCanvasElement
  canvas.style.display = 'block' // make visible
  smIvy.buffer = buffer
  smIvy.canvas = canvas
  smIvy.ctx = buffer.getContext('2d') as CanvasRenderingContext2D
  smIvy.finalCtx = canvas.getContext('2d') as CanvasRenderingContext2D
}

let lastCanvasOffsetWidth = -1
let lastCanvasOffsetHeight = -1
export function fitToContainer(forceReset = false) {
  const cvs = smIvy.canvas
  if (forceReset
    || (cvs.offsetWidth !== lastCanvasOffsetWidth)
    || (cvs.offsetHeight !== lastCanvasOffsetHeight)) {
    lastCanvasOffsetWidth = cvs.offsetWidth
    lastCanvasOffsetHeight = cvs.offsetHeight

    const pixelRatio = window.devicePixelRatio / gfxConfig.flatConfig.pixelScale
    const w = window.innerWidth * pixelRatio
    const h = window.innerHeight * pixelRatio

    cvs.width = w
    cvs.height = h
    smIvy.buffer.width = w
    smIvy.buffer.height = h

    const padding = 10 // (extra zoom IN) thickness of pixels CUT OFF around edges
    const dimension = Math.max(cvs.width, cvs.height) + padding * 2
    smIvy.canvasScale = dimension
    smIvy.canvasOffsetX = (cvs.width - dimension) / 2
    smIvy.canvasOffsetY = (cvs.height - dimension) / 2
    smIvy.ctx.setTransform(smIvy.canvasScale, 0, 0,
      smIvy.canvasScale, smIvy.canvasOffsetX, smIvy.canvasOffsetY)

    const xr = -smIvy.canvasOffsetX / smIvy.canvasScale
    const yr = -smIvy.canvasOffsetY / smIvy.canvasScale
    smIvy.screenCorners = [v(xr, yr), v(1 - xr, yr), v(1 - xr, 1 - yr), v(xr, 1 - yr)]

    reset()
  }
}

function reset() {
  smIvy.resetCountdown = smIvy.resetDelay
  doRandomPattern()

  // // draw scaffolds
  // const g = smIvy.ctx
  // g.strokeStyle = smIvyConstants.scaffoldColor
  // g.lineWidth = smIvyConstants.scaffoldThickness
  // g.beginPath()
  // smIvy.allScaffolds.forEach(s => s.draw(g))
  // g.stroke()
}
