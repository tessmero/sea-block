/**
 * @file raft-drive-game.ts
 *
 * Control craft built from tiles in raft-build-game.
 */
import type { GameUpdateContext } from 'games/game'
import { Game } from 'games/game'
import { FreeCamGame } from './free-cam-game'
import { drivingRaftElement, resetRaftDrive, updateRaftDrive } from 'games/raft/raft-drive-helper'
import { raftBuildPipeline } from 'gfx/3d/pipelines/raft-build-pipeline'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { Pipeline } from 'gfx/3d/pipelines/pipeline'
import type { SeaBlock } from 'sea-block'

export class RaftDriveGame extends FreeCamGame {
  static {
    RaftDriveGame.registerGame()
  }

  static registerGame() {
    Game.register('raft-drive', {
      factory: () => new RaftDriveGame(),
      guiName: 'free-cam',
      elements: [
        drivingRaftElement,
      ],
    })
  }

  public reset(context: SeaBlock): void {
    resetRaftDrive(context)
  }

  public getTerrainRenderPipeline(_tile: TileIndex): Pipeline {
    return raftBuildPipeline
  }

  public update(context: GameUpdateContext): void {
    updateRaftDrive(context)
    // this.centerOnAnchor(this.cameraAnchor)
  }
}
