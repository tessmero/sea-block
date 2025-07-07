/**
 * @file main.ts
 *
 * Entry point and main loop.
 */

import { SeaBlock } from './sea-block'

export const seaBlock = new SeaBlock()

seaBlock.refreshConfig()

// override game until next config refresh
seaBlock.setGame('start-sequence')
seaBlock.init()
seaBlock.reset()
// seaBlock.rebuildControls()

// Animation loop
let lastTime = performance.now()

/**
 *
 */
function animate() {
  requestAnimationFrame(animate)

  // Calculate delta time
  const currentTime = performance.now()
  const dt = Math.min(50, currentTime - lastTime)
  lastTime = currentTime

  seaBlock.animate(dt)
}
animate()
