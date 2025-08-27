/**
 * @file raft-piece-dialog-layout.ts
 *
 * Dialog visible when an existing piece is selected.
 * Included in raft-common-layout.
 */

import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import type { CssLayout } from 'util/layout-parser'

export const RAFT_PIECE_DIALOG_LAYOUT = {

  pieceDialogPanel: {
    parent: 'toolbar',
    top: '100%',
    left: 'auto',
  },

  pieceDeleteBtn: {
    parent: 'pieceDialogPanel',
    width: 40,
    right: 0,
    top: '100%',
  },

} as const satisfies CssLayout<RaftLayoutKey>
