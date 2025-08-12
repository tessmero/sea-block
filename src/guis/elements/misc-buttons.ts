/**
 * @file misc-buttons.ts
 *
 * Buttons used in free-cam-gui.
 */

import { CHESS_PLAYLIST, playNextTrack, toggleRadio } from 'audio/song-playlist'
import { getChessCamOffset } from 'games/chess/chess-3d-gfx-helper'
import { ungrabChessPiece } from 'games/imp/free-cam-game'
import { SeamlessTransition } from 'gfx/transitions/imp/seamless-transition'
import { Transition } from 'gfx/transitions/transition'
import type { GuiElement } from 'guis/gui'

export const grabbedMeshPanel: GuiElement = {
  layoutKey: 'grabbedMeshPanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}
export const grabbedMeshDiagram: GuiElement = {
  layoutKey: 'grabbedMeshDiagram',
  display: {
    type: 'diagram',
    label: 'grabbed-mesh-diagram', // give imageset unique hash
    isVisible: false,
  },
}
export const grabbedMeshPlayButton: GuiElement = {
  layoutKey: 'grabbedMeshPlayButton',
  display: {
    type: 'button',
    label: 'Play',
    isVisible: false,
  },
  clickAction: ({ seaBlock }) => {
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
    seaBlock.startTransition({
      transition: Transition.create('seamless', seaBlock),
      callback: () => {
        playNextTrack(CHESS_PLAYLIST)
      },
    })
    seaBlock.onCtrlChange(item)
  },
}
export const grabbedMeshCancelButton: GuiElement = {
  layoutKey: 'grabbedMeshCancelButton',
  display: {
    type: 'button',
    label: 'Cancel',
    isVisible: false,
  },
  clickAction: ({ seaBlock }) => {
    // restore original mesh position
    ungrabChessPiece(seaBlock)
  },
}
export const grabbedMeshElements = [
  grabbedMeshPanel, grabbedMeshDiagram,
  grabbedMeshPlayButton, grabbedMeshCancelButton,
]

// export const spritAtlasBtn: GuiElement = {
//   display: { type: 'button', label: 'VIEW SPRITES', font: 'mini' },
//   layoutKey: 'spritAtlasBtn',
//   clickAction: ({ seaBlock }) => {
//     const item = seaBlock.config.tree.children.testGui
//     item.value = 'sprite-atlas'
//     seaBlock.onCtrlChange(item)
//   },
// }

export const musicBtn: GuiElement = {
  display: { type: 'button', icon: `icons/16x16-music.png` },
  layoutKey: 'musicBtn',
  hotkeys: ['KeyM'],
  clickAction: () => {
    toggleRadio()
  },
}

export const chessBtn: GuiElement = {
  display: { type: 'button', icon: `icons/16x16-chess.png` },
  layoutKey: 'chessBtn',
  hotkeys: [],
  clickAction: ({ seaBlock }) => {
    const item = seaBlock.config.tree.children.game
    item.value = 'chess'
    seaBlock.onCtrlChange(item)
  },
}

export const configBtn: GuiElement = {
  display: { type: 'button', icon: `icons/16x16-config.png` },
  layoutKey: 'configBtn',
  hotkeys: ['Escape'],
  clickAction: ({ seaBlock }) => {
    seaBlock.rebuildControls()
    // seaBlock.toggleMenu()
  },
}
