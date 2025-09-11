/**
 * @file main.ts
 *
 * Entry point and main loop.
 */

// @ts-expect-error make vite build include all sources
import.meta.glob('./**/*.ts', { eager: true })

import { randChoice } from 'util/rng'
import { TILING } from 'imp-names'
import { gfxConfig } from './configs/imp/gfx-config'
import { LayeredViewport } from './gfx/layered-viewport'
import { SeaBlock } from './sea-block'
import { getTestSupport } from 'test-support'
import { Game } from 'games/game'
import { Gui } from 'guis/gui'
import { loadAllImages } from 'gfx/2d/image-asset-loader'

async function main() {
  const layeredViewport = new LayeredViewport()
  gfxConfig.refreshConfig()

  await loadAllImages()
  const seaBlock = new SeaBlock(layeredViewport)
  await Gui.preload('splash-screen', seaBlock)
  await Game.preload('splash-screen')
  layeredViewport.init(seaBlock)

  // load default config
  seaBlock.config.refreshConfig()

  // if (!isDevMode) { // apply splash config
  // set temporary config values until user clicks launch
  seaBlock.config.flatConfig.generator = 'all-ocean'
  seaBlock.config.flatConfig.style = 'black-and-white'
  seaBlock.config.flatConfig.game = 'splash-screen'
  seaBlock.config.flatConfig.tiling = randChoice(TILING.NAMES)
  // }

  // init game and 3D scene
  seaBlock.init()
  seaBlock.reset();

  // TestSupport // support automated report on tessmero.github.io //
  (window as any).TestSupport = getTestSupport(seaBlock) // eslint-disable-line @typescript-eslint/no-explicit-any

  // if (isDevMode) {
  //   seaBlock.rebuildControls() // show controls gui on startup
  // }

  // Animation loop
  let lastTime = performance.now()
  async function animate() {
    requestAnimationFrame(animate) // queue next loop

    // Calculate delta time since last loop
    const currentTime = performance.now()
    const dt = Math.min(50, currentTime - lastTime)
    lastTime = currentTime

    await seaBlock.update(dt) // update everything
  }
  animate() // start first loop
}

main()
