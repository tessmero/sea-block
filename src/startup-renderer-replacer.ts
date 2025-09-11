/**
 * @file startup-renderer-replacer.ts
 *
 * Logic to switch to non-antialiased renderer after clicking launch.
 */

import { isDevMode } from 'configs/imp/top-config'
import type { SeaBlock } from 'sea-block'
import { WebGLRenderer } from 'three'

export async function splashScreenMidTransition(seaBlock: SeaBlock) {
  seaBlock.currentGameName = 'free-cam'

  // special case, just clicked "launch"
  // replace back canvas and renderer
  const renderer = seaBlock.layeredViewport.backRenderer
  renderer.dispose()
  renderer.domElement.remove()
  const newCanvas = document.createElement('canvas') as HTMLCanvasElement
  newCanvas.id = 'backCanvas'
  document.body.appendChild(newCanvas)
  seaBlock.layeredViewport.backCanvas = newCanvas
  seaBlock.layeredViewport.backRenderer = new WebGLRenderer({
    canvas: seaBlock.layeredViewport.backCanvas,
    antialias: false,
  })
  seaBlock.orbitControls.domElement = newCanvas

  // fullscreen
  if (!isDevMode) {
    // start switch to fullscreen
    document.documentElement.requestFullscreen()

    // after two animation frames, update layout
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          seaBlock.onResize()
          resolve()
        })
      })
    })
  }
}
