/**
 * @file settings-gui.ts
 *
 * Common settings dialog panel, shown in front of other GUIs.
 */

import type { NumericItem } from 'configs/config-tree'
import { gfxConfig } from 'configs/imp/gfx-config'
import { audioConfig } from 'configs/imp/audio-config'
import type { ImageAssetUrl } from 'gfx/2d/image-asset-loader'
import type { ElementEvent, GuiElement } from 'guis/gui'
import { Gui } from 'guis/gui'
import type { SettingsLayoutKey } from 'guis/keys/settings-layout-keys'
import { SETTINGS_LAYOUT } from 'guis/layouts/settings-layout'
import { lerp } from 'three/src/math/MathUtils.js'
import { updateAllSfxVolumes } from 'audio/sound-effect-player'
import { updateAllSongVolumes } from 'audio/song-player'
import type { SeaBlock } from 'sea-block'

type Selem = GuiElement<SettingsLayoutKey>
const settingsPanel: Selem = {
  layoutKey: 'settingsPanel',
  display: {
    type: 'panel',
  },
}

type SettingsSlider = {
  item: NumericItem
  onChange: (seaBlock: SeaBlock) => void
  elements: SliderElements
}
type SliderElements = {
  label: Selem
  region: Selem
  slider: Selem
}

const _SLIDER_KEYS = ['musicVolume', 'sfxVolume', 'pixelScale'] as const
type SliderKey = (typeof _SLIDER_KEYS)[number]

const allSliders: Record<SliderKey, SettingsSlider> = {
  musicVolume: {
    elements: buildSliderElements('musicVolume', { label: 'MUSIC' }),
    item: audioConfig.tree.children.musicVolume,
    onChange: updateAllSongVolumes,
  },
  sfxVolume: {
    elements: buildSliderElements('sfxVolume', { label: 'SOUND EFFECTS' }),
    item: audioConfig.tree.children.sfxVolume,
    onChange: updateAllSfxVolumes,
  },
  pixelScale: {
    elements: buildSliderElements('pixelScale', { label: 'PIXEL SCALE' }),
    item: gfxConfig.tree.children.pixelScale,
    onChange: (seaBlock) => {
      seaBlock.onCtrlChange(gfxConfig.tree.children.pixelScale)
    },
  },
}

type SliderParams = {
  label?: string
  icon?: ImageAssetUrl
}

function buildSliderElements(key: SliderKey, params: SliderParams): SliderElements {
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
      clickAction: (e) => {
        _slideSetting(key, e)
      },
      dragAction: (e) => {
        _slideSetting(key, e)
      },

    } as Selem,
  }
  return result
}

function _slideSetting(key: SliderKey, event: ElementEvent) {
  const { seaBlock, sliderState } = event
  const ss = allSliders[key]
  const { item, onChange } = ss
  if (!sliderState) {
    return // A button pressed while slider was highlighted. do nothing
  }
  const { min, max, step } = item
  if (typeof min !== 'number' || typeof max !== 'number' || typeof step !== 'number') {
    throw new Error('numeric item used for in-game settings must define min,max,step')
  }

  // update config item
  item.value = step * Math.round(lerp(min, max, sliderState.x) / step) // round to nearest step

  onChange(seaBlock) // do setting-specific action
  _updateSliderDisplay(ss) // snap slider to real value
}

function updateSettingSliders() {
  for (const key in allSliders) {
    const composite = allSliders[key]
    _updateSliderDisplay(composite)
  }
}

function _updateSliderDisplay(ss: SettingsSlider) {
  const { elements, item } = ss
  const { slider, region } = elements
  const { value, min, max } = item
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('numeric item used for in-game settings must define min,max')
  }

  slider.display.forcedSliderState = {
    x: (value - min) / (max - min),
    y: 0,
  }

  // update slider display
  region.display.needsUpdate = true
  slider.display.needsUpdate = true
}

const settingsCloseBtn: Selem = {
  layoutKey: 'settingsCloseBtn',
  gamepadNavBox: 'settingsTitleBar',
  hotkeys: ['ButtonB'],
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
  },
  clickAction: ({ seaBlock }) => {
    seaBlock.toggleSettings()
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
          slider => Object.values(slider.elements),
        ),

        settingsCloseBtn,
      ],
    })
  }

  public refreshLayout(context: SeaBlock): void {
    super.refreshLayout(context)
    updateSettingSliders()
  }
}
