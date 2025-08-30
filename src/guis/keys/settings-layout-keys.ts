/**
 * @file settings-layout-keys.ts
 *
 * Names for rectangles in common settings dialog.
 */

export const SETTINGS_LAYOUT_KEYS = [
  'settingsPanel',
  'settingsTitleBar',

  'musicVolumeLabel',
  'musicVolumeRegion',
  'musicVolumeSlider',

  'sfxVolumeLabel',
  'sfxVolumeRegion',
  'sfxVolumeSlider',

  'pixelScaleLabel',
  'pixelScaleRegion',
  'pixelScaleSlider',

  'settingsCloseBtn',
] as const
export type SettingsLayoutKey = (typeof SETTINGS_LAYOUT_KEYS)[number]
