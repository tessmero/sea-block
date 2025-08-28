/**
 * @file settings-layout-keys.ts
 *
 * Names for rectangles in common settings dialog.
 */

export const SETTINGS_LAYOUT_KEYS = [
  'settingsPanel',
  'musicVolumeLabel',
  'musicVolumeRegion',
  'musicVolumeSlider',
  'sfxVolumeLabel',
  'sfxVolumeRegion',
  'sfxVolumeSlider',
  'settingsCloseBtn',
] as const
export type SettingsLayoutKey = (typeof SETTINGS_LAYOUT_KEYS)[number]
