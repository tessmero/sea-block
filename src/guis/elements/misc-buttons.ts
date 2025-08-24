/**
 * @file misc-buttons.ts
 *
 * Buttons used in free-cam-gui.
 */

import { CHESS_PLAYLIST, playNextTrack, toggleRadio } from 'audio/song-playlist'
import { playSound } from 'audio/sound-effects'
import { getChessCamOffset } from 'games/chess/gfx/chess-3d-gfx-helper'
import { ChessScenery } from 'games/chess/levels/chess-scenery'
import { ungrabChessPiece } from 'games/imp/free-cam-game'
import { SeamlessTransition } from 'gfx/transitions/imp/seamless-transition'
import { Transition } from 'gfx/transitions/transition'
import type { GuiElement } from 'guis/gui'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'

type FreecamElem = GuiElement<FreecamLayoutKey>

export const grabbedMeshPanel: FreecamElem = {
  layoutKey: 'grabbedMeshPanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}
export const grabbedMeshDiagram: FreecamElem = {
  layoutKey: 'grabbedMeshDiagram',
  display: {
    type: 'diagram',
    label: 'grabbed-mesh-diagram', // give imageset unique hash
    isVisible: false,
  },
}
export const grabbedMeshPlayButton: FreecamElem = {
  layoutKey: 'grabbedMeshPlayButton',
  display: {
    type: 'button',
    label: 'Play',
    isVisible: false,
  },
  clickAction: ({ seaBlock }) => {
    playSound('click')
    // restore original mesh position
    ungrabChessPiece(seaBlock)
    // targetElement.layoutKey = undefined
    // targetMesh.position.copy(originalTargetMeshPosition)

    // FreeCamGame.hasGrabbedMeshReachedTarget = false // start smooth lerp

    // // close display
    // for (const { display } of grabbedMeshElements) {
    //   display.isVisible = false
    // }

    // switch to chess game
    const item = seaBlock.config.tree.children.game
    item.value = 'chess'
    SeamlessTransition.desiredCameraOffset.copy(getChessCamOffset(seaBlock))
    SeamlessTransition.snapshotTerrain(seaBlock)
    ChessScenery.takeOriginalSnapshot(seaBlock)
    seaBlock.startTransition({
      transition: Transition.create('seamless', seaBlock),
      callback: () => {
        playNextTrack(CHESS_PLAYLIST)
      },
    })
    seaBlock.onCtrlChange(item)
  },
}
export const grabbedMeshCancelButton: FreecamElem = {
  layoutKey: 'grabbedMeshCancelButton',
  display: {
    type: 'button',
    label: 'Cancel',
    isVisible: false,
  },
  clickAction: ({ seaBlock }) => {
    // restore original mesh position

    playSound('click')
    ungrabChessPiece(seaBlock)
  },
}
export const grabbedMeshElements = [
  grabbedMeshPanel, grabbedMeshDiagram,
  grabbedMeshPlayButton, grabbedMeshCancelButton,
]

// export const spritAtlasBtn: FreecamElem = {
//   display: { type: 'button', label: 'VIEW SPRITES', font: 'mini' },
//   layoutKey: 'spritAtlasBtn',
//   clickAction: ({ seaBlock }) => {
//     const item = seaBlock.config.tree.children.testGui
//     item.value = 'sprite-atlas'
//     seaBlock.onCtrlChange(item)
//   },
// }

export const musicBtn: FreecamElem = {
  display: { type: 'button', icon: `icons/16x16-music.png` },
  layoutKey: 'musicBtn',
  hotkeys: ['KeyM'],
  clickAction: () => {
    toggleRadio()
  },
}

export const raftBtn: FreecamElem = {
  display: {
    type: 'button',
    // icon: `icons/16x16-chess.png`
    label: 'RAFT',
  },
  layoutKey: 'raftBtn',
  hotkeys: [],
  clickAction: ({ seaBlock }) => {
    const item = seaBlock.config.tree.children.game
    item.value = 'raft-drive'
    seaBlock.onCtrlChange(item)
  },
}

export const configBtn: FreecamElem = {
  display: { type: 'button', icon: `icons/16x16-config.png` },
  layoutKey: 'configBtn',
  hotkeys: ['Escape'],
  clickAction: ({ seaBlock }) => {
    seaBlock.rebuildControls()
    // seaBlock.toggleMenu()
  },
}
