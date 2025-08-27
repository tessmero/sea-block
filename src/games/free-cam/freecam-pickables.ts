/**
 * @file freecam-pickables.ts
 *
 * List of pickable objects to appear in free-cam, each specifying a diagram and playable game.
 */

import { Vector3 } from 'three'
import type { PickableName, PickableParams } from './freecam-pickable-meshes'
import { SeamlessTransition } from 'gfx/transitions/imp/seamless-transition'
import { getChessCamOffset } from 'games/chess/gfx/chess-3d-gfx-helper'
import { ChessScenery } from 'games/chess/levels/chess-scenery'
import { Transition } from 'gfx/transitions/transition'
import { CHESS_PLAYLIST, playNextTrack, RAFT_PLAYLIST } from 'audio/song-playlist'

export const allPickableParams: Record<PickableName, PickableParams> = {

  rook: {
    model: 'chess/rook.obj',
    position: new Vector3(0, 12, 0),
    icon: 'icons/chess/16x16-rook.png',
    iconOffset: [9, 14],
    title: 'ROOK',
    subtitle: 'CHESS PIECE',
    playAction: (seaBlock) => {
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
  },

  thruster: {
    model: 'raft/thruster.obj',
    position: new Vector3(10, 12, 0),
    icon: 'icons/raft/16x16-thruster.png',
    iconOffset: [0, 14],
    title: 'THRUSTER',
    subtitle: 'MACHINE PART',
    playAction: (seaBlock) => {
      // switch to raft game
      ChessScenery.takeOriginalSnapshot(seaBlock)
      seaBlock.startTransition({
        callback: () => {
          seaBlock.config.tree.children.generator.value = 'all-ocean'
          const item = seaBlock.config.tree.children.game
          item.value = 'raft'
          seaBlock.onCtrlChange(item)
          playNextTrack(RAFT_PLAYLIST)
        },
      })
    },
  },
}
