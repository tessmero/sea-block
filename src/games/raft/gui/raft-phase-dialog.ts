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
import { raft } from '../raft'

type RaftElem = GuiElement<RaftLayoutKey>

const buildCancelBtn: RaftElem = {
  layoutKey: 'buildCancelBtn',
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
    isVisible: false,
  },
  clickAction: () => raft.cancelBuild(),
}

const userFriendlyLabels = {
  'idle': '...',
  'edit-button': 'connect button',
  'show-all-wires': 'show all wires',
  'place-floor': 'place floor tile',
  'place-button': 'place button',
  'place-thruster': 'place thruster',
} as const satisfies Record<RaftPhase, string>

// debug labels
const phasePanels = Object.fromEntries(
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
    const { display } = phasePanels[key]
    display.isVisible = (key === phase)
    display.needsUpdate = true
  }
  buildCancelBtn.display.isVisible = phase !== 'idle'
  buildCancelBtn.display.needsUpdate = true
}

export function hideBuildPhasePanel() {
  for (const key of RAFT_PHASES) {
    const { display } = phasePanels[key]
    display.isVisible = false
    display.needsUpdate = true
  }
  buildCancelBtn.display.isVisible = false
  buildCancelBtn.display.needsUpdate = true
}

export const raftPhaseDialogElements: Array<RaftElem> = [
  ...Object.values(phasePanels),
  buildCancelBtn,
]
