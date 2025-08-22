/**
 * @file raft.ts
 *
 * Raft/raft singleton main helper for raft-build game.
 */
import type { SeaBlock } from 'sea-block'
import type { GameUpdateContext } from 'games/game'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { ChessWaveMaker } from 'games/chess/chess-wave-maker'
import { RaftHlTiles } from './raft-hl-tiles'
import type { ProcessedSubEvent } from 'mouse-touch-input'
import type { RenderablePiece, UniquePiece } from './raft-gfx-helper'
import { buildingRaftGroup, cockpitMesh, instancedPieceMeshes,
  registerInstancedPiece, setPiecePosition } from './raft-gfx-helper'
import type { Object3D } from 'three'
import { Euler, Vector3 } from 'three'
import { showPhaseLabel } from './raft-build-gui-elements'
import type { PlaceablePieceName, RaftPhase } from './raft-enums'
import { drivingRaftGroup } from './raft-drive-helper'

export const RAFT_MAX_RAD = 2

export let raft: Raft
export function resetRaftBuild(context: SeaBlock): void {
  // find center tile based on camera target
  // const { target } = orbitControls
  // const { x, z } = target
  const { terrain } = context
  const { x, z } = terrain.centerXZ
  const coord = terrain.grid.positionToCoord(x, z)
  const centerTile = terrain.grid.xzToIndex(coord.x, coord.z)
  if (!centerTile) {
    throw new Error(`could not find center tile at position ${x.toFixed(2)},${z.toFixed(2)}`)
  }

  raft = new Raft(context, centerTile)
}

export function updateRaftBuild(_context: GameUpdateContext): void {
  raft.update()
}

export class Raft {
  public currentPhase: RaftPhase = 'idle'

  protected waveMaker: ChessWaveMaker // Replace 'any' with actual type if available

  public readonly hlTiles = new RaftHlTiles() // Highlighted tiles (raft-specific)
  public readonly raftTiles: Set<number>
  public readonly raftPieces: Array<RenderablePiece> = []

  public readonly centerPos: Vector3 = new Vector3()

  constructor(
    public readonly context: SeaBlock,
    public readonly centerTile: TileIndex,
  ) {
    this.getPosOnTile(centerTile, this.centerPos)

    buildingRaftGroup.position.copy(this.centerPos)
    drivingRaftGroup.position.copy(this.centerPos)
    drivingRaftGroup.setRotationFromEuler(new Euler())

    this.retrieveMeshesFromDrivingGroup() // in case previously driving raft
    instancedPieceMeshes.forEach((im) => {
      im.position.set(0, 0, 0)
      im.count = 0
    })
    this.waveMaker = new ChessWaveMaker(context.sphereGroup.members[0], context)
    this.raftTiles = new Set([centerTile.i])

    // cockpit position in group is always 0,0,0
    const cockpit: UniquePiece = {
      mesh: cockpitMesh,
      tile: centerTile,
      type: 'cockpit',
    }
    this.raftPieces.push(cockpit)
  }

  update() {
    // this.retrievePiecesFromDrivingGroup() // in case previously driving raft
    this.hlTiles.updateBuildableTiles(this)
  }

  hoverWorld(inputEvent: ProcessedSubEvent): boolean {
    const { pickedTile } = inputEvent
    this.hlTiles.hovered = pickedTile

    if (pickedTile) {
      return true // consume event
    }
    return false
  }

  getPieceOnTile(tile: TileIndex): RenderablePiece | undefined {
    for (const piece of this.raftPieces) {
      if (piece.tile.i === tile.i) {
        return piece
      }
    }
  }

  clickWorld(inputEvent: ProcessedSubEvent): boolean {
    const { pickedTile } = inputEvent

    if (pickedTile && this.hlTiles.buildable.has(pickedTile.i)) {
      // clicked buildable tile

      if (this.currentPhase.startsWith('place-')) {
      // spawn raft piece
        const pieceName = this.currentPhase.slice(6) as PlaceablePieceName
        const spawned = registerInstancedPiece(pieceName, pickedTile)
        this.raftTiles.add(pickedTile.i)
        setPiecePosition(spawned, this.getPosOnTile(pickedTile).sub(this.centerPos))
        this.raftPieces.push(spawned)
        this.cancelPlacePiece()
        return true // consume event
      }
    }
    return false
  }

  public startPlacePiece(pieceName: PlaceablePieceName) {
    this.currentPhase = `place-${pieceName}`
    showPhaseLabel(this.currentPhase)
    this.context.layeredViewport.handleResize(this.context)
  }

  public cancelPlacePiece() {
    this.currentPhase = 'idle'
    showPhaseLabel(this.currentPhase)
    // for( const btn of placePieceButtons ){
    //   btn.display.forcedState = undefined
    // }
  }

  public getPosOnTile(tile: TileIndex, target?: Vector3): Vector3 {
    const { x, z } = this.context.terrain.grid.indexToPosition(tile)
    const height = this.context.terrain.generatedTiles[tile.i]?.liveHeight

    const writeTo = target || positionDummy
    writeTo.set(x, height ?? 12, z)

    return writeTo
  }

  public moveMeshesToDrivingGroup() {
    // Transfer each raft piece mesh/object to the driving group, positioned relative to COM
    const meshes = [
      cockpitMesh,
      ...instancedPieceMeshes,
    ] as Array<Object3D>
    for (const obj of meshes) {
      buildingRaftGroup.remove(obj)
      drivingRaftGroup.add(obj)
    }
  }

  public retrieveMeshesFromDrivingGroup() {
    // Return all raft piece object3d to the main scene (or their original parent)
    const meshes = [
      cockpitMesh,
      ...instancedPieceMeshes,
    ] as Array<Object3D>
    for (const obj of meshes) {
      drivingRaftGroup.remove(obj)
      buildingRaftGroup.add(obj)
    }
  }
}

const positionDummy = new Vector3()
