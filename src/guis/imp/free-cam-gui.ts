/**
 * @file free-cam-gui.ts
 *
 * Gui for free-cam game with WASD or joystick controls.
 */

import { grabbedMeshElements } from 'games/free-cam/freecam-grabbed-mesh-dialog'
import { ungrabFreecamPickable } from 'games/free-cam/freecam-pickable-meshes'
import { leftJoy, leftJoySlider, rightJoy, rightJoySlider } from 'guis/elements/joysticks'
import { debugBtn, fcSettingsBtn } from 'guis/elements/misc-buttons'
import { wasdButtons } from 'guis/elements/wasd-buttons'
import type { RegisteredGui } from 'guis/gui'
import { Gui } from 'guis/gui'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'
import { FREECAM_DESKTOP_LAYOUT } from 'guis/layouts/freecam-desktop-layout'
import { FREECAM_LANDSCAPE_LAYOUT } from 'guis/layouts/freecam-landscape-layout'
import { FREECAM_PORTRAIT_LAYOUT } from 'guis/layouts/freecam-portrait-layout'
import { isTouchDevice } from 'input/mouse-touch-input'
import type { SeaBlock } from 'sea-block'

export class FreeCamGui extends Gui<FreecamLayoutKey> {
  static {
    Gui.register('free-cam', {
      factory: () => new FreeCamGui(),
      elements: [

        // top of screen
        debugBtn,
        // raftBtn,
        fcSettingsBtn,

        // all possible control elements
        leftJoy, leftJoySlider,
        rightJoy, rightJoySlider,
        ...wasdButtons,

        // dialog visible after clicking rook or thruster mesh
        ...grabbedMeshElements,

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
    } satisfies RegisteredGui<FreecamLayoutKey>)
  }

  public closeDialogs(seaBlock: SeaBlock): void {
    super.closeDialogs(seaBlock)
    ungrabFreecamPickable(seaBlock)
  }
}
