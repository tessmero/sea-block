/**
 * @file sm-layout-keys.ts
 *
 * Names for rectangles in start menu layout.
 */

export const SM_LAYOUT_KEYS = [
  'smBanner',
  'smStartBtn',
  'smSettingsBtn',
] as const
export type SmLayoutKey = (typeof SM_LAYOUT_KEYS)[number]
