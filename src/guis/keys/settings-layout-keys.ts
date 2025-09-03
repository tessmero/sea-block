/**
 * @file settings-layout-keys.ts
 *
 * Names for rectangles in common settings dialog.
 */

export const SETTINGS_LAYOUT_KEYS = [
  'settingsPanel',
  'settingsPanelInner', // helper

  // top row
  'settingsTitleBar',
  'settingsCloseBtn',

  // slider to adjust music volume
  'musicVolumeLabel',
  'musicVolumeRegion',
  'musicVolumeSlider',

  'sfxVolumeLabel',
  'sfxVolumeRegion',
  'sfxVolumeSlider',

  'pixelScaleLabel',
  'pixelScaleRegion',
  'pixelScaleSlider',

  // quit button at bottom
  'settingsQuitBtn',

] as const
export type SettingsLayoutKey = (typeof SETTINGS_LAYOUT_KEYS)[number]
