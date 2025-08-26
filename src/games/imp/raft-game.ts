/**
 * @file raft-game.ts
 *
 * Drive raft from raft-build-game with physics, and build while driving.
 */
import type { GameUpdateContext } from 'games/game'
import { Game } from 'games/game'
import { FreeCamGame } from './free-cam-game'
import { drivingRaftElement, getRaftDriveCameraOverride,
  raftRig, resetRaftDrive, updateRaftDrive } from 'games/raft/raft-drive-helper'
import type { SeaBlock } from 'sea-block'

export class RaftGame extends FreeCamGame {
  static {
    Game.register('raft', {
      factory: () => new RaftGame(),
      guiName: 'raft',
      elements: [
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

  protected centerOnAnchor(context: SeaBlock) {
    const { cameraAnchor } = this
    const { terrain, camera, orbitControls: controls } = context

    if (!cameraAnchor) return

    const { x, z } = cameraAnchor.position
    camera.position.set(
      x + (camera.position.x - this._lastAnchorPosition.x),
      camera.position.y, // y + (camera.position.y - lastPlayerPosition.y),
      z + (camera.position.z - this._lastAnchorPosition.z),
    )
    this._lastAnchorPosition.copy(cameraAnchor.position)
    // controls.target.set(x, CAMERA_LOOK_AT.y, z)
    controls.target.set(x, 14, z)
    controls.update()

    terrain.panToCenter(x, z)
  }
}
