/**
 * @file settings-layout.ts
 *
 * Layout for common settings dialog.
 */

import type { SettingsLayoutKey } from 'guis/keys/settings-layout-keys'
import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
const { btn } = standards

const rowThickness = 12

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
    left: 0,
    width: '100%',
    height: rowThickness,
  },

  musicVolumeLabel: {
    parent: 'settingsPanel',
    top: rowThickness * 1,
    left: 0,
    width: '100%',
    height: rowThickness,
  },
  musicVolumeRegion: {
    parent: 'settingsPanel',
    top: rowThickness * 2,
    left: 0,
    width: '100%',
    height: rowThickness,
  },
  musicVolumeSlider: {
    parent: 'musicVolumeRegion',
    width: 10,
    left: 'auto',
  },

  sfxVolumeLabel: {
    parent: 'settingsPanel',
    top: rowThickness * 3,
    left: 0,
    width: '100%',
    height: rowThickness,
  },
  sfxVolumeRegion: {
    parent: 'settingsPanel',
    top: rowThickness * 4,
    left: 0,
    width: '100%',
    height: rowThickness,
  },
  sfxVolumeSlider: {
    parent: 'sfxVolumeRegion',
    width: 10,
    left: 'auto',
  },

  pixelScaleLabel: {
    parent: 'settingsPanel',
    top: rowThickness * 5,
    left: 0,
    width: '100%',
    height: rowThickness,
  },
  pixelScaleRegion: {
    parent: 'settingsPanel',
    top: rowThickness * 6,
    left: 0,
    width: '100%',
    height: rowThickness,
  },
  pixelScaleSlider: {
    parent: 'pixelScaleRegion',
    width: 10,
    left: 'auto',
  },

  settingsCloseBtn: {
    parent: 'settingsPanel',
    ...btn,
    right: 0,
  },

} as const satisfies CssLayout<SettingsLayoutKey>
