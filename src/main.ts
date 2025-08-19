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
import { gfxConfig } from './configs/gfx-config'
import { LayeredViewport } from './gfx/layered-viewport'
import { SeaBlock } from './sea-block'
import { loadAllMeshes } from 'gfx/3d/mesh-asset-loader'
import { initAllSoundEffects } from 'audio/sound-effects'
import { loadAllSounds } from 'audio/sound-asset-loader'

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

  /////////////////////////////////////////////////////////////////////////
  // START TestSupport // support automated report on tessmero.github.io //
  /////////////////////////////////////////////////////////////////////////
  (window as any).TestSupport = { // eslint-disable-line @typescript-eslint/no-explicit-any

    getGameState: () => {
      if (!seaBlock.didLoadAssets) {
        return 'loading'
      }
      if (seaBlock.transition) {
        return 'transition'
      }
      return seaBlock.currentGameName
    },

    getCameraPos: () => {
      const { x, y, z } = seaBlock.camera.position
      return [x, y, z]
    },

    getCursorState: () => {
      if (!('mousePosForTestSupport' in seaBlock)) {
        return null
      }
      return {
        x: (seaBlock as any).mousePosForTestSupport.x, // eslint-disable-line @typescript-eslint/no-explicit-any
        y: (seaBlock as any).mousePosForTestSupport.y, // eslint-disable-line @typescript-eslint/no-explicit-any
        style: document.documentElement.style.cursor,
      }
    },

    locateElement(titleKey) {
      const rect = seaBlock.game.gui.layoutRectangles[titleKey]
      if (!rect) return
      const { x, y, w, h } = rect
      const ps = seaBlock.config.flatConfig.pixelScale
      return [x * ps, y * ps, w * ps, h * ps]

    // const elem = global.gui.findElements({ titleKey }).next().value;
    // const screenRect = elem._rect;
    // return this._computeCanvasRect(screenRect);
    },
  }
  ///////////////////////////////////////////////////////////////////////
  // END TestSupport // support automated report on tessmero.github.io //
  ///////////////////////////////////////////////////////////////////////

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

    await seaBlock.animate(dt) // update everything
  }
  animate() // start first loop
}

main()
