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
import { pieceDeleteBtn } from './raft-piece-dialog'

type RaftElem = GuiElement<RaftLayoutKey>

const buildCancelBtn: RaftElem = {
  layoutKey: 'buildCancelBtn',
  display: {
    type: 'button',
    label: 'DONE',
    font: 'mini',
    isVisible: false,
  },
  clickAction: () => raft.cancelBuild(),
}

const userFriendlyLabels = {
  'idle': '...',
  'edit-button': 'Button',
  'show-all-wires': 'show all wires',
  'place-floor': 'place floors',
  'place-button': 'place buttons',
  'place-thruster': 'place thrusters',
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
    vis(phasePanels[key], key === phase)
  }
  vis(buildCancelBtn, phase !== 'idle')

  // show delete button if editing button
  vis(pieceDeleteBtn, phase === 'edit-button')
}

function vis({ display }: GuiElement, isVisible: boolean) {
  display.isVisible = isVisible
  display.needsUpdate = true
}

export function hideBuildPhasePanel() {
  for (const key of RAFT_PHASES) {
    vis(phasePanels[key], false)
  }
  vis(buildCancelBtn, false)
}

export const raftPhaseDialogElements: Array<RaftElem> = [
  ...Object.values(phasePanels),
  buildCancelBtn,
]
