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
    width: 8 * 16,
    left: 'auto',
  },

  buildCancelBtn: {
    parent: 'buildPhasePanel',
    width: 32,
    left: 0,
    top: '100%',
  },
} as const satisfies CssLayout<RaftLayoutKey>
