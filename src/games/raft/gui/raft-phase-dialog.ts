/**
 * @file raft-phase-dialog.ts
 *
 * Gui elements that cover toolbar when selecting
 * a tile to place a new piece.
 */

import type { GuiElement } from 'guis/gui'
import type { RaftPhase } from '../raft-enums'
import { RAFT_PHASES } from '../raft-enums'
import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'

type RaftElem = GuiElement<RaftLayoutKey>

const userFriendlyLabels = {
  'idle': '...',
  'wires': 'show all wires',
  'place-floor': 'place floor tile',
  'place-button': 'place button',
  'place-thruster': 'place thruster',
} as const satisfies Record<RaftPhase, string>

// debug labels
export const raftBuildPhasePanels = Object.fromEntries(
  RAFT_PHASES.map(phase => [
    phase,
    {
      layoutKey: 'buildPhasePanel',
      isPickable: false,
      display: {
        type: 'panel',
        // label: phase,
        label: userFriendlyLabels[phase],
        // font: 'mini',
        isVisible: false,
      },
    } satisfies RaftElem,
  ]),
) as Record<RaftPhase, RaftElem>

export function showBuildPhasePanel(phase: RaftPhase) {
  for (const key of RAFT_PHASES) {
    const { display } = raftBuildPhasePanels[key]
    display.isVisible = (key === phase)
    display.needsUpdate = true
  }
}
