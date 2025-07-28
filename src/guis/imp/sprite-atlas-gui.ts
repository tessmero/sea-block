/**
 * @file sprite-atlas-gui.ts
 *
 * Display all loaded/generated sprites for debugging.
 */

import type { GuiElement } from 'guis/gui'
import { Gui } from 'guis/gui'
import { SPRITE_ATLAS_GUI_LAYOUT } from 'guis/layouts/sprite-atlas-gui-layout'

// const lyt = SPRITE_ATLAS_GUI_LAYOUT
// const y0 = lyt.backPanel.top
// const barHeight = lyt.backPanel.height

const scrollBar: GuiElement = {
  layoutKey: 'scrollBar',
  display: { type: 'panel' },
  // dragAction: (event) => {
  //   //slider.display.offsetY = Math.max(0, Math.min(barHeight, event.lvPos.y - y0))
  //   scrollBar.display.offsetY = 20//Math.min(barHeight, event.lvPos.y)
  //   scrollBar.display.needsUpdate = true
  // },
}

const scrollBarSlider: GuiElement = {
  layoutKey: 'scrollBarSlider',
  slideIn: 'scrollBar',
  display: { type: 'button' },
  clickAction: () => {
    scrollBar.display.needsUpdate = true
  },
  dragAction: () => {
    scrollBar.display.needsUpdate = true
  },
}

export class SpriteAtlasGui extends Gui {
  static {
    Gui.register('sprite-atlas', {
      factory: () => new SpriteAtlasGui(),
      layoutFactory: () => (SPRITE_ATLAS_GUI_LAYOUT),
      elements: [
        {
          layoutKey: 'backPanel',
          display: { type: 'panel' },
          hotkeys: [],
        },
        // {
        //   layoutKey: 'draggablePanel',
        //   dragAction: (event) => {
        //     const { x, y } = event.lvPos
        //     console.log(`draggablePanel dragged ${x},${y}`)
        //   },
        //   display: { type: 'panel' },
        // },
        scrollBar,
        scrollBarSlider,
      ],
    })
  }
}
