/**
 * @file raft-build-gui-elements.ts
 *
 * Gui elements included in raft-build-gui.
 */

import type { GuiElement } from 'guis/gui'
import type { RaftPhase } from './raft-enums'
import { PLACEABLE_PIECE_NAMES, RAFT_PHASES } from './raft-enums'
import { raft } from './raft'
import { Transition } from 'gfx/transitions/transition'

export const placePieceButtons = PLACEABLE_PIECE_NAMES.map((name, i) => ({
  layoutKey: `button${i}`,
  display: {
    type: 'button',
    label: name,
  },
  clickAction: () => {
    // console.log(`clicked piece button ${name}`)
    raft.startPlacePiece(name)
  },
} as GuiElement))

const userFriendlyLabels = {
  'idle': '...',
  'place-floor': 'place floor tile',
  'place-thruster': 'place thruster',
} as const satisfies Record<RaftPhase, string>

// debug labels
const defaultPhase: RaftPhase = 'idle'
const phaseLabels = Object.fromEntries(
  RAFT_PHASES.map(phase => [
    phase,
    {
      layoutKey: 'phaseLabel',
      isPickable: false,
      display: {
        type: 'panel',
        // label: phase,
        label: userFriendlyLabels[phase],
        // font: 'mini',
        isVisible: phase === defaultPhase,
      },
    } as GuiElement,
  ]),
) as Record<RaftPhase, GuiElement>

export function showPhaseLabel(phase: RaftPhase) {
  for (const key of RAFT_PHASES) {
    const { display } = phaseLabels[key]
    display.isVisible = (key === phase)
    display.needsUpdate = true
  }
}

export const driveBtn: GuiElement = {
  layoutKey: 'driveBtn',
  display: {
    type: 'button',
    label: 'drive',
  },
  clickAction: (event) => {
    const { seaBlock } = event
    // switch to chess game
    const item = seaBlock.config.tree.children.game
    item.value = 'raft-drive'
    // SeamlessTransition.desiredCameraOffset.copy(getChessCamOffset(seaBlock))
    // SeamlessTransition.snapshotTerrain(seaBlock)
    // ChessScenery.takeOriginalSnapshot(seaBlock)
    raft.moveMeshesToDrivingGroup()
    raft.hlTiles.clear()
    seaBlock.startTransition({
      transition: Transition.create('seamless', seaBlock),
    })
    seaBlock.onCtrlChange(item)
  },
}

export const RAFT_BUILD_GUI_ELEMENTS = [
  ...placePieceButtons,
  ...Object.values(phaseLabels),
  driveBtn,
]
