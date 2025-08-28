/**
 * @file settings-gui.ts
 *
 * Common settings dialog panel, shown in front of other GUIs.
 */

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

const musicVolumeLabel: Selem = {
  layoutKey: 'musicVolumeLabel',
  display: {
    type: 'label',
    label: 'Music Volume',
  },
}

const musicVolumeRegion: Selem = {
  layoutKey: 'musicVolumeRegion',
  display: {
    type: 'panel',
  },
}

const musicVolumeSlider: Selem = {
  layoutKey: 'musicVolumeSlider',
  slideIn: 'musicVolumeRegion',
  display: {
    type: 'button',
  },
}

const sfxVolumeLabel: Selem = {
  layoutKey: 'sfxVolumeLabel',
  display: {
    type: 'label',
    label: 'SFX Volume',
  },
}

const sfxVolumeRegion: Selem = {
  layoutKey: 'sfxVolumeRegion',
  display: {
    type: 'panel',
  },
}

const sfxVolumeSlider: Selem = {
  layoutKey: 'sfxVolumeSlider',
  slideIn: 'sfxVolumeRegion',
  display: {
    type: 'button',
  },
}

const settingsCloseBtn: Selem = {
  layoutKey: 'settingsCloseBtn',
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
        musicVolumeLabel,
        musicVolumeRegion,
        musicVolumeSlider,
        sfxVolumeLabel,
        sfxVolumeRegion,
        sfxVolumeSlider,
        settingsCloseBtn,
      ],
    })
  }
}
