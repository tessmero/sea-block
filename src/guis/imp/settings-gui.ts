/**
 * @file settings-gui.ts
 *
 * Gui that is toggled by top-left button.
 */

import { Gui } from 'guis/gui'
import { SETTINGS_LAYOUT } from 'guis/layouts/settings-layout'
import type { GuiElement } from 'guis/gui'
import { optionSelectorElements } from 'guis/elements/option-selector'
import { gfxConfig } from 'configs/imp/gfx-config'
import type { OptionItem } from 'configs/config-tree'
import { topConfig } from 'configs/imp/top-config'

const elements: Array<GuiElement> = [
  {
    layoutKey: 'backPanel',
    display: { type: 'panel' },
    // slideIn: 'screen',
    hotkeys: [],
  },

  {
    layoutKey: 'closeBtn',
    display: { type: 'button', icon: 'icons/16x16-x.png' },
    clickAction: ({ seaBlock }) => {
      // seaBlock.toggleMenu()
      const item = seaBlock.config.tree.children.testGui
      item.value = 'none'
      seaBlock.onCtrlChange(item)
    },
  },

  ...configOptionSelector({
    layoutKey: 'styleOption',
    itemLabel: 'COLORS',
    item: gfxConfig.tree.children.style,
  }),

  ...configOptionSelector({
    layoutKey: 'tilingOption',
    itemLabel: 'TILING',
    item: topConfig.tree.children.tiling,
  }),

  ...configOptionSelector({
    layoutKey: 'generatorOption',
    itemLabel: 'TERRAIN',
    item: topConfig.tree.children.generator,
  }),

  ...configOptionSelector({
    layoutKey: 'layoutOption',
    itemLabel: 'CONTROLS',
    item: topConfig.tree.children.freeCamLayout,
  }),

  // {
  //   layoutKey: 'debugBtn',
  //   display: { type: 'button', icon: 'icons/16x16-ellipsis.png' },
  //   hotkeys: [],
  //   clickAction: (seaBlock) => {
  //     // seaBlock.toggleMenu()
  //     toggleDebugControls(seaBlock)
  //   },
  // },
]

// label and previous/next buttons for a config item
function configOptionSelector(params: { layoutKey: string, itemLabel: string, item: OptionItem }): Array<GuiElement> {
  const { layoutKey, itemLabel, item } = params
  return optionSelectorElements({
    layoutKey,
    itemLabel,
    options: item.options,
    value: item.value,
    onChange: (seaBlock, value) => {
      item.value = value
      seaBlock.onCtrlChange(item)
    },
  })
}

export class SettingsGui extends Gui {
  static {
    Gui.register('settings-menu', {
      factory: () => new SettingsGui(),
      layoutFactory: () => SETTINGS_LAYOUT,
      elements,
    })
  }
}
