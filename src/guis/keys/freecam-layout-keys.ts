/**
 * @file freecam-layout-keys.ts
 *
 * Names for rectangles in free-cam guis.
 */

export const FREECAM_LAYOUT_KEYS = [

  // butons along top of screen
  'debugBtn',
  'raftBtn',
  'settingsBtn',

  // desktop controls
  '_wasdBtnRegion',
  'upBtn', 'downBtn', 'leftBtn', 'rightBtn',

  // virtual joysticks
  'leftJoy', 'leftJoySlider',
  'rightJoy', 'rightJoySlider',

  // dialog visible after clicking mesh
  'grabbedMesh',
  'sgpAnchor',
  'grabbedMeshPanel',
  'grabbedMeshDiagram',
  'grabbedMeshPlayButton',
  'grabbedMeshCancelButton',

] as const
export type FreecamLayoutKey = (typeof FREECAM_LAYOUT_KEYS)[number]
