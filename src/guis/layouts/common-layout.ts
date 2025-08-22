/**
 * @file common-layout.ts
 *
 * Common buttons at top of screen used in free-cam game.
 */
import type { CssLayout } from 'util/layout-parser'
import { standards } from './layout-helper'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'
const { btn, pad, point } = standards

export const COMMON_LAYOUT = {

  // config on top left
  configBtn: { ...btn,
    top: pad,
    left: pad,
  },

  // play/stop on top right
  musicBtn: { ...btn,
    top: pad,
    right: pad,
  },

  // 2025-08-21
  raftBtn: { ...btn,
    width: 40,
    top: pad,
    right: btn.width + 2 * pad,
  },

  // anchor mesh on screen after fiding mesh in free-cam world
  grabbedMesh: {
    ...point,

    'left@landscape': '33%',
    'top@landscape': 'auto',

    'left@portrait': 'auto',
    'top@portrait': '33%',
  },

  // dialog to start mini-game
  sgpAnchor: { // center of panel
    ...point,

    'left@landscape': '67%',
    'top@landscape': 'auto',

    'left@portrait': 'auto',
    'top@portrait': '67%',
  },
  grabbedMeshPanel: {
    parent: 'sgpAnchor',
    width: 16 * 5,
    height: 16 * 5,
    left: 'auto',
    top: 'auto',
  },
  grabbedMeshDiagram: {
    parent: 'grabbedMeshPanel',
    width: -16,
    left: 'auto',
    height: 40,
  },
  grabbedMeshPlayButton: {
    parent: 'grabbedMeshPanel',
    width: 64,
    height: 20,
    left: 'auto',
    bottom: 28,
  },
  grabbedMeshCancelButton: {
    parent: 'grabbedMeshPanel',
    width: 64,
    height: 20,
    left: 'auto',
    bottom: 8,
  },

} as const satisfies CssLayout<FreecamLayoutKey>
