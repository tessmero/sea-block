/**
 * @file settings-gui.ts
 *
 * Common settings dialog panel, shown in front of other GUIs.
 */

import type { NumericItem } from 'configs/config-tree'
import { gfxConfig } from 'configs/imp/gfx-config'
import { audioConfig } from 'configs/imp/audio-config'
import type { ImageAssetUrl } from 'gfx/2d/image-asset-urls'
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
    border: '16x16-dark-panel',
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
    elements: buildSliderElements('sfxVolume', { label: 'SOUNDS' }),
    item: audioConfig.tree.children.sfxVolume,
    onChange: updateAllSfxVolumes,
  },
  pixelScale: {
    elements: buildSliderElements('pixelScale', { label: 'SCALE' }),
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
        type: 'ss-region',
      },
    } as Selem,

    slider: {
      layoutKey: `${key}Slider`,
      slideIn: `${key}Region`,
      gamepadNavBox: `${key}Region`,
      display: {
        type: 'button',
        border: '16x16-btn-sm',
        shouldSnapToPixel: true, // don't anti-alias slider
        gamepadPrompt: { isHidden: true }, // no 'A' overlay when selected
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

// small x on top right
const settingsCloseBtn: Selem = {
  layoutKey: 'settingsCloseBtn',
  gamepadNavBox: 'settingsTitleBar',
  hotkeys: ['ButtonB'],
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
    gamepadPrompt: {
      offset: [-12, 0],
    },
  },
  clickAction: ({ seaBlock }) => {
    seaBlock.toggleSettings()
  },
}

// wide quit button at bottom
const settingsQuitBtn: Selem = {
  layoutKey: 'settingsQuitBtn',
  gamepadNavBox: 'settingsQuitBtn',
  display: {
    type: 'button',
    label: 'QUIT',
    gamepadPrompt: {
      offset: [-20, 0],
    },
  },
  clickAction: ({ seaBlock }) => {
    seaBlock.toggleSettings()
    if (seaBlock.currentGameName === 'free-cam') {
      seaBlock.config.tree.children.game.value = 'start-menu'
    }
    else {
      seaBlock.config.tree.children.game.value = 'free-cam'
    }
    seaBlock.startTransition()
  },
}

const settingsOkayBtn: Selem = {
  layoutKey: 'settingsQuitBtn',
  gamepadNavBox: 'settingsQuitBtn',
  display: {
    type: 'button',
    label: 'OKAY',
    gamepadPrompt: {
      offset: [-20, 0],
    },
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
        settingsCloseBtn,

        // sliders as flat list of elements
        ...Object.values(allSliders).flatMap(
          slider => Object.values(slider.elements),
        ),

        settingsQuitBtn,
        settingsOkayBtn,
      ],
    })
  }

  public resetElementStates(seaBlock: SeaBlock): void {
    super.resetElementStates(seaBlock)

    if (seaBlock.currentGameName === 'start-menu') {
      settingsOkayBtn.display.isVisible = true
      settingsQuitBtn.display.isVisible = false
    }
    else {
      settingsOkayBtn.display.isVisible = false
      settingsQuitBtn.display.isVisible = true
    }
  }

  public refreshLayout(context: SeaBlock): void {
    super.refreshLayout(context)
    updateSettingSliders()
  }
}
