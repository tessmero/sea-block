/**
 * @file raft-layout-keys.ts
 *
 * List of names for rectangles in raft gui.
 */

import { FREECAM_LAYOUT_KEYS } from './freecam-layout-keys'

export const RAFT_LAYOUT_KEYS = [
  ...FREECAM_LAYOUT_KEYS,

  // toolbar row along top of screen
  'toolbar',
  'placeFloorBtn',
  'placeButtonBtn',
  'placeThrusterBtn',
  'wiresBtn',

  // top right quit game button
  'raftSettingsBtn',

  // when existing piece is selected
  'pieceDialogPanel',
  'pieceDeleteBtn',

  // when placing new piece
  'buildPhasePanel',
  'buildCancelBtn',

] as const

export type RaftLayoutKey = (typeof RAFT_LAYOUT_KEYS)[number]
