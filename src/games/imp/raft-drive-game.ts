/**
 * @file raft-drive-game.ts
 *
 * Drive raft from raft-build-game with physics, and build while driving.
 */
import type { GameUpdateContext } from 'games/game'
import { Game } from 'games/game'
import { FreeCamGame } from './free-cam-game'
import { drivingRaftElement, getRaftDriveCameraOverride,
  raftRig, resetRaftDrive, updateRaftDrive } from 'games/raft/raft-drive-helper'
import type { SeaBlock } from 'sea-block'
import { cockpitElement, instancedPieceElements } from 'games/raft/raft-gfx-helper'
import { cursorElement } from 'games/raft/raft-mouse-input-helper'

export class RaftDriveGame extends FreeCamGame {
  static {
    RaftDriveGame.registerGame()
  }

  static registerGame() {
    Game.register('raft-drive', {
      factory: () => new RaftDriveGame(),
      guiName: 'raft-drive',
      elements: [
        ...instancedPieceElements,
        cockpitElement,
        cursorElement,
        drivingRaftElement,
      ],
    })
  }

  getCameraOverride = getRaftDriveCameraOverride

  public reset(context: SeaBlock): void {
    super.reset(context)
    this.cameraAnchor.isGhost = true
    resetRaftDrive(context)
  }

  // public getTerrainRenderPipeline(_tile: TileIndex): Pipeline {
  //   return raftBuildPipeline
  // }

  public update(context: GameUpdateContext): void {
    // super.update(context)

    this.cameraAnchor.position = raftRig.getCameraTarget()
    this.cameraAnchor.isGhost = true
    this.centerOnAnchor(context.seaBlock)
    updateRaftDrive(context)
  }
}
