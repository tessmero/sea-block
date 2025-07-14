/**
 * @file main.ts
 *
 * Entry point and main loop.
 */

// @ts-expect-error make vite build include all sources
import.meta.glob('./**/*.ts', { eager: true })

import { LayeredViewport } from './gfx/layered-viewport'
import { randomTransition } from './gfx/transition'
import { SeaBlock } from './sea-block'

export const layeredViewport = new LayeredViewport()
layeredViewport.config.refreshConfig()
layeredViewport.init()

const seaBlock = new SeaBlock(layeredViewport)

// load default config
seaBlock.config.refreshConfig()

// init game and 3D scene
seaBlock.init()
seaBlock.reset()

// show controls gui on startup
// seaBlock.rebuildControls()

// allow skipping start sequence with escape key
function handleEscapePress(event) {
  if (event.key === 'Escape') {
    // seaBlock.game.traveled = seaBlock.game.distForFreeCam
    seaBlock.transition = randomTransition(seaBlock.layeredViewport)
    seaBlock.isCovering = true

    // document.removeEventListener('keydown', handleEscapePress)
  }
}
document.addEventListener('keydown', handleEscapePress)

// Animation loop
let lastTime = performance.now()
function animate() {
  requestAnimationFrame(animate) // queue next loop

  // Calculate delta time since last loop
  const currentTime = performance.now()
  const dt = Math.min(50, currentTime - lastTime)
  lastTime = currentTime

  seaBlock.animate(dt) // update everything
}
animate() // start first loop
