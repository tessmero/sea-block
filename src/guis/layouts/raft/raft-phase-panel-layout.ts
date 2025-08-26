/**
 * @file raft-phase-panel-layout.ts
 *
 * Layout for panel at top of screen when new raft pieces.
 * Included in raft-common-layout.
 */

import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import type { CssLayout } from 'util/layout-parser'

export const RAFT_PHASE_PANEL_LAYOUT = {

  buildPhasePanel: {
    parent: 'toolbar',
    top: '100%',
  },

  buildCancelBtn: {
    parent: 'buildPhasePanel',
    width: 16,
    right: 0,
  },
} as const satisfies CssLayout<RaftLayoutKey>
