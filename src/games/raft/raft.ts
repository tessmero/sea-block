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
import type { Group, Intersection, Object3D } from 'three'
import { Vector3 } from 'three'
import { showPhaseLabel } from './raft-build-gui-elements'
import type { PieceName, PlaceablePieceName, RaftPhase } from './raft-enums'
import { drivingRaftGroup } from './raft-drive-helper'
import { cursorMesh } from './raft-mouse-input-helper'
import type { TiledGrid } from 'core/grid-logic/tiled-grid'
import type { AutoThruster } from './raft-auto-thrusters'
import { getThrusterDirection } from './raft-auto-thrusters'

export const RAFT_MAX_RAD = 3

export let raft: Raft
export function resetRaftBuild(context: SeaBlock): void {
  // find center tile based on camera target
  // const { target } = orbitControls
  // const { x, z } = target
  const { terrain } = context
  const { x, z } = terrain.centerXZ
  const coord = terrain.grid.positionToCoord(x, z)
  const centerTile = JSON.parse(JSON.stringify(terrain.grid.xzToIndex(coord.x, coord.z)))
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

  public readonly grid: TiledGrid
  public readonly hlTiles = new RaftHlTiles() // Highlighted tiles (raft-specific)
  public readonly raftTiles: Set<number>
  public readonly raftPieces: Array<RenderablePiece> = []
  public readonly thrusters: Array<AutoThruster> = []

  public readonly centerPos: Vector3 = new Vector3()

  constructor(
    public readonly context: SeaBlock,
    public readonly centerTile: TileIndex,
  ) {
    this.grid = context.terrain.grid.clone()
    this.getPosOnTile(centerTile, this.centerPos)

    buildingRaftGroup.position.copy(this.centerPos)
    // drivingRaftGroup.setRotationFromEuler(new Euler())
    drivingRaftGroup.position.copy(this.centerPos)
    // drivingRaftGroup.setRotationFromEuler(new Euler())

    this.moveMeshesTo(buildingRaftGroup) // in case previously driving raft
    Object.values(instancedPieceMeshes).forEach((im) => {
      im.position.set(0, 0, 0)
      im.count = 0
    })
    this.waveMaker = new ChessWaveMaker(context.sphereGroup.members[0], context)
    this.raftTiles = new Set([centerTile.i])

    // place starting floor tiles around center/cockpit
    this._buildTestFloor()

    // place 8 starting buttons around center/cockpit
    this._buildTestButtons()

    // cockpit position in group is always 0,0,0
    const cockpit: UniquePiece = {
      mesh: cockpitMesh,
      tile: centerTile,
      type: 'cockpit',
    }
    this.raftPieces.push(cockpit)
  }

  private _buildTestFloor() {
    const { centerTile } = this
    const rad = 2
    for (let dx = -rad; dx <= rad; dx++) {
      for (let dz = -rad; dz <= rad; dz++) {
        if (dx === 0 && dz === 0) {
          continue
        }
        const tile = this.grid.xzToIndex(centerTile.x + dx, centerTile.z + dz)
        if (tile) {
          this.buildPiece('floor', tile)
        }
      }
    }
  }

  private _buildTestButtons() {
    const { centerTile } = this
    const dx = 0
    const dz = 1

    const tile = this.grid.xzToIndex(centerTile.x + dx, centerTile.z + dz)
    if (tile) {
      this.buildPiece('button', tile)
    }
  }

  update() {
    this.moveMeshesTo(buildingRaftGroup) // in case previously driving raft
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

  // pick chess piece or treasure chest
  public getPickedPieceMesh(inputEvent: ProcessedSubEvent): RenderablePiece | undefined {
  // hover mesh on 3d tile
    const { pickedMesh } = inputEvent
    if (pickedMesh) {
    // console.log('chess input picked mesh')

      // check for extra propertu assigned in game.ts
      const elem = (pickedMesh as any).gameElement// eslint-disable-line @typescript-eslint/no-explicit-any

      if (elem && 'pieceName' in elem) {
        const pieceName = elem.pieceName as PieceName
        const { instanceId } = inputEvent.rawPick as Intersection
        if (typeof instanceId === 'number') {
          return this.identifyPiece(pieceName, instanceId)
        }
      }
    }
  }

  // identify picked mesh instance
  public identifyPiece(type: PieceName, index: number): RenderablePiece | undefined {
    for (const piece of this.raftPieces) {
      if (piece.type === type && 'index' in piece && piece.index === index) {
        return piece
      }
    }
  }

  buildPiece(pieceName: PlaceablePieceName, tile: TileIndex) {
    // add mesh instance and logical raft piece
    const spawned = registerInstancedPiece(pieceName, tile)
    this.raftTiles.add(tile.i)
    setPiecePosition(spawned, this.getPosOnTile(tile).sub(this.centerPos))
    this.raftPieces.push(spawned)

    if (pieceName === 'thruster') {
      // add new thruster to auto-thruster logic
      this.thrusters.push({
        dx: tile.x - raft.centerTile.x,
        dz: tile.z - raft.centerTile.z,
        direction: getThrusterDirection(tile),
        isFiring: false,
      })
    }

    this.hlTiles.updateBuildableTiles(this)
  }

  clickWorld(inputEvent: ProcessedSubEvent): boolean {
    const { pickedTile } = inputEvent

    if (pickedTile && this.hlTiles.buildable.has(pickedTile.i)) {
      // clicked buildable tile

      if (this.currentPhase.startsWith('place-')) {
      // spawn raft piece
        const pieceName = this.currentPhase.slice(6) as PlaceablePieceName
        this.buildPiece(pieceName, pickedTile)
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
    const height = 12// this.context.terrain.generatedTiles[tile.i]?.liveHeight

    const writeTo = target || positionDummy
    writeTo.set(x, height ?? 12, z)

    return writeTo
  }

  public moveMeshesTo(group: Group) {
    // Transfer each raft piece mesh/object to the driving group, positioned relative to COM
    const meshes = [
      cursorMesh,
      cockpitMesh,
      ...Object.values(instancedPieceMeshes),
    ] as Array<Object3D>
    for (const obj of meshes) {
      group.add(obj)
    }
  }
}

const positionDummy = new Vector3()
