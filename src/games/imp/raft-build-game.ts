/**
 * @file raft-build-game.ts
 *
 * Build raft locked to terrain grid. Points to modules in src/games/raft.
 */
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { Game } from 'games/game'
import { resetRaftBuild, updateRaftBuild } from 'games/raft/raft'
import { buildingRaftGroupElement, cockpitElement, instancedPieceElements } from 'games/raft/raft-gfx-helper'
import type { Pipeline } from 'gfx/3d/pipelines/pipeline'
import { raftBuildPipeline } from 'gfx/3d/pipelines/raft-build-pipeline'

export class RaftBuildGame extends Game {
  static {
    Game.register('raft-build', {
      factory: () => new RaftBuildGame(),
      guiName: 'raft-build',
      elements: [
        ...instancedPieceElements,
        cockpitElement,
        buildingRaftGroupElement,
      ],
    })
  }

  public getTerrainRenderPipeline(_tile: TileIndex): Pipeline {
    return raftBuildPipeline
  }

  reset = resetRaftBuild
  update = updateRaftBuild
}
