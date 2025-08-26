/**
 * @file raft-piece-dialog.ts
 *
 * Gui elements that cover the toolbar when an
 * existing piece has been hovered/clicked.
 */

import type { GuiElement } from 'guis/gui'
import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import type { PieceName } from '../raft-enums'
import { PIECE_NAMES } from '../raft-enums'
import { type RenderablePiece } from '../gfx/raft-gfx-helper'
import { resetFrontLayer } from 'gfx/2d/flat-gui-gfx-helper'
import type { SeaBlock } from 'sea-block'
import { raft } from '../raft'
import { hideRaftWires, showRaftWires } from '../gfx/raft-wires-overlay'

type RaftElem = GuiElement<RaftLayoutKey>

const raftPieceDialogPanel: RaftElem = {
  layoutKey: 'pieceDialogPanel',
  isPickable: false,
  display: {
    type: 'panel',
    isVisible: false,
    shouldClearBehind: true,
  },
}

const userFriendlyLabels = {
  cockpit: 'Cockpit',
  floor: 'Floor',
  button: 'Button',
  thruster: 'Thruster',
} as const satisfies Record<PieceName, string>

export const raftPieceLabels = Object.fromEntries(
  PIECE_NAMES.map(piece => [
    piece,
    {
      layoutKey: 'pieceDialogPanel',
      isPickable: false,
      display: {
        type: 'label',
        label: userFriendlyLabels[piece],
        isVisible: false,
      },
    } satisfies RaftElem,
  ]),
) as Record<string, RaftElem>

const pieceDeleteBtn: RaftElem = {
  layoutKey: 'pieceDeleteBtn',
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
    isVisible: false,
  },
  clickAction: () => {

  },
}

export const raftPieceDialogElements: Array<RaftElem> = [
  raftPieceDialogPanel,
  ...Object.values(raftPieceLabels),
  pieceDeleteBtn,
]

export function showPieceHovered(piece: RenderablePiece) {
  for (const pieceName in raftPieceLabels) {
    const { display } = raftPieceLabels[pieceName]
    display.isVisible = pieceName === piece.type
    display.needsUpdate = true
  }
  raftPieceDialogPanel.display.isVisible = true
  raftPieceDialogPanel.display.needsUpdate = true

  // update wires overlay
  if (raft.currentPhase === 'edit-button') {
    showRaftWires(raft.editingButton)
  }
  else if (raft.currentPhase !== 'show-all-wires') {
    hideRaftWires()
    if (piece.type === 'button') {
      const i = raft.raftPieces.indexOf(piece)
      const btn = raft.buttons.find(button => button.pieceIndex === i)
      if (btn) {
        showRaftWires(btn)
      }
    }
  }
}

export function hidePieceDialog(seaBlock: SeaBlock) {
  for (const pieceName in raftPieceLabels) {
    const { display } = raftPieceLabels[pieceName]
    display.isVisible = false
    display.needsUpdate = true
  }
  raftPieceDialogPanel.display.isVisible = false
  raftPieceDialogPanel.display.needsUpdate = true
  resetFrontLayer(seaBlock)
}
