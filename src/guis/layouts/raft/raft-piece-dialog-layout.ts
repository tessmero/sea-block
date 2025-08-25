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
    width: 80,
    left: 'auto',
  },

  pieceDeleteBtn: {
    parent: 'pieceDialogPanel',
    width: 16,
    left: 0,
  },

} as const satisfies CssLayout<RaftLayoutKey>
