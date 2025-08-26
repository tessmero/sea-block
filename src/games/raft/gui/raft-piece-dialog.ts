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

export const pieceDeleteBtn: RaftElem = {
  layoutKey: 'pieceDeleteBtn',
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
    isVisible: false,
  },
  clickAction: () => {
    if (raft.currentPhase === 'edit-button') {
      if (raft.editingButton) {
        raft.deletePiece(raft.raftPieces[raft.editingButton.pieceIndex])
        raft.editingButton = undefined
        raft.startPhase('idle')
        // hideRaftWires()
      }
    }
    else if (clickedPiece) { // assigned in showPieceClicked()
      raft.deletePiece(clickedPiece)
      clickedPiece = undefined
    }
  },
}

export const raftPieceDialogElements: Array<RaftElem> = [
  raftPieceDialogPanel,
  ...Object.values(raftPieceLabels),
  pieceDeleteBtn,
]

function vis({ display }: GuiElement, isVisible: boolean) {
  display.isVisible = isVisible
  display.needsUpdate = true
}

export let clickedPiece: RenderablePiece | undefined = undefined
export function showPieceClicked(piece: RenderablePiece) {
  clickedPiece = piece // checked on delete button click
  showPieceHovered(piece) // show dialog without buttons
  vis(pieceDeleteBtn, true) // add delete button
}

export function showPieceHovered(piece: RenderablePiece) {
  // show pieece dialog without delete button
  for (const pieceName in raftPieceLabels) {
    vis(raftPieceLabels[pieceName], pieceName === piece.type)
  }
  vis(pieceDeleteBtn, false)
  vis(raftPieceDialogPanel, true)

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
  for (const { display } of raftPieceDialogElements) {
    display.isVisible = false
    display.needsUpdate = true
  }
  resetFrontLayer(seaBlock)
}
