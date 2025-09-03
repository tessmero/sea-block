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
const labelwidth = 50

const row = {
  height: rowThickness,
  width: rowWidth,
  left: 'auto',
} as const

const label = {
  height: rowThickness,
  width: labelwidth,
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

  settingsPanelInner: {
    parent: 'settingsPanel',
    top: 4, // offset for settings rows
  },

  musicVolumeLabel: {
    parent: 'settingsPanelInner',
    top: rowThickness * 1,
    ...label,
  },
  musicVolumeRegion: {
    parent: 'settingsPanelInner',
    top: rowThickness * 2,
    ...row,
  },
  musicVolumeSlider: {
    parent: 'musicVolumeRegion',
    width: 10,
  },

  sfxVolumeLabel: {
    parent: 'settingsPanelInner',
    top: rowThickness * 3,
    ...label,
  },
  sfxVolumeRegion: {
    parent: 'settingsPanelInner',
    top: rowThickness * 4,
    ...row,
  },
  sfxVolumeSlider: {
    parent: 'sfxVolumeRegion',
    width: 10,
  },

  pixelScaleLabel: {
    parent: 'settingsPanelInner',
    top: rowThickness * 5,
    ...label,
  },
  pixelScaleRegion: {
    parent: 'settingsPanelInner',
    top: rowThickness * 6,
    ...row,
  },
  pixelScaleSlider: {
    parent: 'pixelScaleRegion',
    width: 10,
  },

  // big bottom center button
  settingsQuitBtn: {
    parent: 'settingsPanel',
    width: rowWidth,
    height: 16,
    left: 'auto',
    bottom: 0,
  },

} as const satisfies CssLayout<SettingsLayoutKey>
