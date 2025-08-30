/**
 * @file settings-gui.ts
 *
 * Common settings dialog panel, shown in front of other GUIs.
 */

import type { ImageAssetUrl } from 'gfx/2d/image-asset-loader'
import type { GuiElement } from 'guis/gui'
import { Gui } from 'guis/gui'
import type { SettingsLayoutKey } from 'guis/keys/settings-layout-keys'
import { SETTINGS_LAYOUT } from 'guis/layouts/settings-layout'

type Selem = GuiElement<SettingsLayoutKey>
const settingsPanel: Selem = {
  layoutKey: 'settingsPanel',
  display: {
    type: 'panel',
  },
}

type SettingsSlider = {
  label: Selem
  region: Selem
  slider: Selem
}

const _SLIDER_KEYS = ['musicVolume', 'sfxVolume', 'pixelScale'] as const
type SliderKey = (typeof _SLIDER_KEYS)[number]

type SliderParams = {
  label?: string
  icon?: ImageAssetUrl
}

function buildSlider(key: SliderKey, params: SliderParams): SettingsSlider {
  const { label, icon } = params
  const result = {

    label: {
      layoutKey: `${key}Label`,
      display: {
        type: 'label',
        label, icon,
        font: 'mini',
      },
    } as Selem,

    region: {
      layoutKey: `${key}Region`,
      display: {
        // type: 'panel',
        type: 'button',
      },
    } as Selem,

    slider: {
      layoutKey: `${key}Slider`,
      slideIn: `${key}Region`,
      gamepadNavBox: `${key}Region`,
      display: {
        type: 'button',
      },
      clickAction: () => {
        const { region, slider } = result
        region.display.needsUpdate = true
        slider.display.needsUpdate = true
      },
      dragAction: () => {
        const { region, slider } = result
        region.display.needsUpdate = true
        slider.display.needsUpdate = true
      },

    } as Selem,
  }
  return result
}

const allSliders: Record<SliderKey, SettingsSlider> = {
  musicVolume: buildSlider('musicVolume', { label: 'MUSIC' }),
  sfxVolume: buildSlider('sfxVolume', { label: 'SOUND EFFECTS' }),
  pixelScale: buildSlider('pixelScale', { label: 'PIXEL SCALE' }),
}

const settingsCloseBtn: Selem = {
  layoutKey: 'settingsCloseBtn',
  gamepadNavBox: 'settingsTitleBar',
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
  },
  clickAction: ({ seaBlock }) => {
    seaBlock.isShowingSettingsMenu = false
    seaBlock.onResize()
  },
}

export class SettingsGui extends Gui<SettingsLayoutKey> {
  static {
    Gui.register('settings-menu', {
      factory: () => new SettingsGui(),
      layoutFactory: () => SETTINGS_LAYOUT,
      elements: [
        settingsPanel,

        // sliders as flat list of elements
        ...Object.values(allSliders).flatMap(
          slider => Object.values(slider),
        ),

        settingsCloseBtn,
      ],
    })
  }
}
