/**
 * @file raft-common-layout.ts
 *
 * Raft toolbar and dialogs along top of screen.
 */

import { RAFT_TOOLBAR_BUTTONS } from 'games/raft/gui/raft-toolbar-elements'
import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import type { CssLayout } from 'util/layout-parser'
import { RAFT_PIECE_DIALOG_LAYOUT } from './raft-piece-dialog-layout'
import { RAFT_PHASE_PANEL_LAYOUT } from './raft-phase-panel-layout'
import { standards } from '../layout-helper'

const { btn } = standards

const buttonWidth = 16
// const allButtons: Array<RaftLayoutKey> = ['placeFloorBtn', 'placeButtonBtn', 'placeThrusterBtn']

export const RAFT_COMMON_LAYOUT = {

  toolbar: {
    height: 16,
    width: RAFT_TOOLBAR_BUTTONS.length * buttonWidth,
    left: 'auto',
  },

  raftSettingsBtn: {
    ...btn,
    right: 0,
  },

  ...Object.fromEntries(RAFT_TOOLBAR_BUTTONS.map((name, i) => [
    name,
    {
      parent: 'toolbar',
      width: buttonWidth,
      left: buttonWidth * i,
    },
  ])),

  prevToolBtn: {
    parent: 'toolbar',
    width: 32,
    height: 16,
    right: '100%',
  },

  nextToolBtn: {
    parent: 'toolbar',
    width: 32,
    height: 16,
    bottom: 0,
    left: '100%',
  },

  ...RAFT_PHASE_PANEL_LAYOUT,
  ...RAFT_PIECE_DIALOG_LAYOUT,

} as const satisfies CssLayout<RaftLayoutKey>
