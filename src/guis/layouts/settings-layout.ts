/**
 * @file settings-layout.ts
 *
 * Layout for common settings dialog.
 */

import type { SettingsLayoutKey } from 'guis/keys/settings-layout-keys'
import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
const { btn } = standards

const rowThickness = 8
const rowWidth = 68 // width with margin inside of panel

const row = {
  height: rowThickness,
  width: rowWidth,
  left: 'auto',
} as const

export const SETTINGS_LAYOUT = {

  settingsPanel: {
    width: 80,
    height: 80,
    left: 'auto',
    top: 'auto',
  },

  settingsTitleBar: {
    parent: 'settingsPanel',
    top: 0,
    height: rowThickness,
  },

  settingsCloseBtn: {
    parent: 'settingsPanel',
    ...btn,
    right: 0,
  },

  musicVolumeLabel: {
    parent: 'settingsPanel',
    top: rowThickness * 1,
    ...row,
  },
  musicVolumeRegion: {
    parent: 'settingsPanel',
    top: rowThickness * 2,
    ...row,
  },
  musicVolumeSlider: {
    parent: 'musicVolumeRegion',
    width: 10,
  },

  sfxVolumeLabel: {
    parent: 'settingsPanel',
    top: rowThickness * 3,
    ...row,
  },
  sfxVolumeRegion: {
    parent: 'settingsPanel',
    top: rowThickness * 4,
    ...row,
  },
  sfxVolumeSlider: {
    parent: 'sfxVolumeRegion',
    width: 10,
  },

  pixelScaleLabel: {
    parent: 'settingsPanel',
    top: rowThickness * 5,
    ...row,
  },
  pixelScaleRegion: {
    parent: 'settingsPanel',
    top: rowThickness * 6,
    ...row,
  },
  pixelScaleSlider: {
    parent: 'pixelScaleRegion',
    width: 10,
  },

  settingsQuitBtn: {
    parent: 'settingsPanel',
    width: rowWidth,
    height: 16,
    left: 'auto',
    bottom: 0,
  },

} as const satisfies CssLayout<SettingsLayoutKey>
