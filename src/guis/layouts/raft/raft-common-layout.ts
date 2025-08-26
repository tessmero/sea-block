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

const buttonWidth = 32
// const allButtons: Array<RaftLayoutKey> = ['placeFloorBtn', 'placeButtonBtn', 'placeThrusterBtn']

export const RAFT_COMMON_LAYOUT = {

  toolbar: {
    height: 16,
  },

  ...Object.fromEntries(RAFT_TOOLBAR_BUTTONS.map((name, i) => [
    name,
    {
      parent: 'toolbar',
      width: buttonWidth,
      left: buttonWidth * i,
    },
  ])),

  ...RAFT_PHASE_PANEL_LAYOUT,
  ...RAFT_PIECE_DIALOG_LAYOUT,

} as const satisfies CssLayout<RaftLayoutKey>
