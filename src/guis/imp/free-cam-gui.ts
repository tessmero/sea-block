/**
 * @file free-cam-gui.ts
 *
 * Gui for free-cam game with WASD or joystick controls.
 */

import { leftJoy, leftJoySlider, rightJoy, rightJoySlider } from 'guis/elements/joysticks'
import { chessBtn, configBtn, musicBtn } from 'guis/elements/misc-buttons'
import { wasdButtons } from 'guis/elements/wasd-buttons'
import { Gui } from 'guis/gui'
import { FREECAM_DESKTOP_LAYOUT } from 'guis/layouts/freecam-desktop-layout'
import { FREECAM_LANDSCAPE_LAYOUT } from 'guis/layouts/freecam-landscape-layout'
import { FREECAM_PORTRAIT_LAYOUT } from 'guis/layouts/freecam-portrait-layout'
import { isTouchDevice } from 'mouse-touch-input'
import type { SeaBlock } from 'sea-block'

export class FreeCamGui extends Gui {
  static {
    Gui.register('free-cam', {
      factory: () => new FreeCamGui(),
      elements: [
        // spritAtlasBtn,
        musicBtn,
        chessBtn,
        configBtn,
        leftJoy, leftJoySlider,
        rightJoy, rightJoySlider,
        ...wasdButtons,
      ],
      allLayouts: [
        FREECAM_DESKTOP_LAYOUT,
        FREECAM_LANDSCAPE_LAYOUT,
        FREECAM_PORTRAIT_LAYOUT,
      ],
      layoutFactory: (context: SeaBlock) => {
      // context.config.refreshConfig()
        const lyt = context.config.flatConfig.freeCamLayout
        if (lyt === 'portrait') {
          return FREECAM_PORTRAIT_LAYOUT
        }
        else if (lyt === 'landscape') {
          return FREECAM_LANDSCAPE_LAYOUT
        }
        else if (lyt === 'desktop') {
          return FREECAM_DESKTOP_LAYOUT
        }

        // select layout for 'auto' layout mode
        if (isTouchDevice) { // mouse-touch-input.ts
          const { layeredViewport } = context
          const { w, h } = layeredViewport
          if (w > h) {
            return FREECAM_LANDSCAPE_LAYOUT
          }
          return FREECAM_PORTRAIT_LAYOUT
        }
        return FREECAM_DESKTOP_LAYOUT
      },
    })
  }
}
