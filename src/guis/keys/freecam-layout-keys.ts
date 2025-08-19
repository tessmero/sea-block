/**
 * @file freecam-layout-keys.ts
 *
 * Names for rectangles in free-cam guis.
 */

export const FREECAM_LAYOUT_KEYS = [

  'configBtn',
  'chessBtn',
  'musicBtn',

  '_wasdBtnRegion',
  'upBtn', 'downBtn', 'leftBtn', 'rightBtn',

  'leftJoy', 'leftJoySlider',
  'rightJoy', 'rightJoySlider',

  'grabbedMesh',
  'sgpAnchor',
  'grabbedMeshPanel',
  'grabbedMeshDiagram',
  'grabbedMeshPlayButton',
  'grabbedMeshCancelButton',
] as const
export type FreecamLayoutKey = (typeof FREECAM_LAYOUT_KEYS)[number]
