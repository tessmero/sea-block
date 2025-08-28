/**
 * @file settings-layout.ts
 *
 * Layout for common settings dialog.
 */

import type { SettingsLayoutKey } from 'guis/keys/settings-layout-keys'
import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
const { btn } = standards

export const SETTINGS_LAYOUT = {

  settingsPanel: {
    width: 80,
    height: 80,
    left: 'auto',
    top: 'auto',
  },

  musicVolumeLabel: {
    parent: 'settingsPanel',
    top: 0,
    left: 0,
    width: '100%',
    height: 20,
  },
  musicVolumeRegion: {
    parent: 'settingsPanel',
    top: 20,
    left: 0,
    width: '100%',
    height: 20,
  },
  musicVolumeSlider: {
    parent: 'musicVolumeRegion',
    width: 10,
    left: 'auto',
  },

  sfxVolumeLabel: {
    parent: 'settingsPanel',
    top: 40,
    left: 0,
    width: '100%',
    height: 20,
  },
  sfxVolumeRegion: {
    parent: 'settingsPanel',
    top: 60,
    left: 0,
    width: '100%',
    height: 20,
  },
  sfxVolumeSlider: {
    parent: 'sfxVolumeRegion',
    width: 10,
    left: 'auto',
  },

  settingsCloseBtn: {
    parent: 'settingsPanel',
    ...btn,
    right: 0,
  },

} as const satisfies CssLayout<SettingsLayoutKey>
