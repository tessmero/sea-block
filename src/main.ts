/**
 * @file main.ts
 *
 * Entry point and main loop.
 */

// @ts-expect-error make vite build include all sources
import.meta.glob('./**/*.ts', { eager: true })

import { loadAllImages } from 'gfx/2d/image-loader'
import { gfxConfig } from './configs/gfx-config'
import { LayeredViewport } from './gfx/layered-viewport'
import { TILING_NAMES } from './imp-names'
import { SeaBlock } from './sea-block'
import { randChoice } from './util/rng'

async function main() {
  await loadAllImages()

  const layeredViewport = new LayeredViewport()
  gfxConfig.refreshConfig()

  const seaBlock = new SeaBlock(layeredViewport)

  // load default config
  seaBlock.config.refreshConfig()

  // set temporary config values until user clicks launch
  seaBlock.config.flatConfig.generator = 'all-ocean'
  seaBlock.config.flatConfig.style = 'black-and-white'
  seaBlock.config.flatConfig.game = 'splash-screen'
  seaBlock.config.flatConfig.tiling = randChoice(TILING_NAMES)

  // init game and 3D scene
  seaBlock.init()
  seaBlock.reset()

  // show controls gui on startup
  // seaBlock.rebuildControls()

  // Animation loop
  let lastTime = performance.now()
  async function animate() {
    requestAnimationFrame(animate) // queue next loop

    // Calculate delta time since last loop
    const currentTime = performance.now()
    const dt = Math.min(50, currentTime - lastTime)
    lastTime = currentTime

    await seaBlock.animate(dt) // update everything
  }
  animate() // start first loop
}

main()
