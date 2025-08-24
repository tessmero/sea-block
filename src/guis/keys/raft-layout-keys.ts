/**
 * @file raft-layout-keys.ts
 *
 * List of names for rectangles in raft gui.
 */

import { FREECAM_LAYOUT_KEYS } from './freecam-layout-keys'

export const RAFT_LAYOUT_KEYS = [
  ...FREECAM_LAYOUT_KEYS,

  // unlock camera from raft and stop picking pieces
  'doneBuildingBtn', // bottom-right
] as const

export type RaftLayoutKey = (typeof RAFT_LAYOUT_KEYS)[number]
