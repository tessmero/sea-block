/**
 * @file main.ts
 *
 * Entry point and main loop.
 */

// @ts-expect-error make vite build include all sources
import.meta.glob('./**/*.ts', { eager: true })

import { randChoice } from 'util/rng'
import { loadAllImages } from 'gfx/2d/image-asset-loader'
import { TILING } from 'imp-names'
import { gfxConfig } from './configs/imp/gfx-config'
import { LayeredViewport } from './gfx/layered-viewport'
import { SeaBlock } from './sea-block'
import { loadAllMeshes } from 'gfx/3d/mesh-asset-loader'
import { initAllSoundEffects } from 'audio/sound-effect-player'
import { loadAllSounds } from 'audio/sound-asset-loader'
import { getTestSupport } from 'test-support'

async function main() {
  // preload all assets (except music)
  // console.log('start preload assets')
  await Promise.all([
    loadAllImages(),
    loadAllMeshes(),
    loadAllSounds(),
  ])
  initAllSoundEffects()
  // console.log('finish preload assets')

  const layeredViewport = new LayeredViewport()
  gfxConfig.refreshConfig()

  const seaBlock = new SeaBlock(layeredViewport)
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
