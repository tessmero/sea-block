/**
 * @file raft.ts
 *
 * Raft/raft singleton main helper for raft-build game.
 */
import type { SeaBlock } from 'sea-block'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { ChessWaveMaker } from 'games/chess/chess-wave-maker'
import { RaftHlTiles } from './raft-hl-tiles'
import type { ProcessedSubEvent } from 'mouse-touch-input'
import type { RenderablePiece, UniquePiece } from './gfx/raft-gfx-helper'
import { cockpitMesh, instancedPieceMeshes,
  registerInstancedPiece, setPiecePosition,
} from './gfx/raft-gfx-helper'
import type { Intersection } from 'three'
import { Vector3 } from 'three'
import type { PieceName, PlaceablePieceName, RaftPhase } from './raft-enums'
import { drivingRaftGroup } from './raft-drive-helper'
import type { TiledGrid } from 'core/grid-logic/tiled-grid'
import type { AutoThruster } from './raft-auto-thrusters'
import { getThrusterDirection } from './raft-auto-thrusters'
import type { RaftButton } from './raft-buttons'
import { hidePieceDialog } from './gui/raft-piece-dialog'
import { hideBuildPhasePanel, showBuildPhasePanel } from './gui/raft-phase-dialog'
import { resetFrontLayer } from 'gfx/2d/flat-gui-gfx-helper'

import testRaft from './blueprints/test-raft.json'
import type { RaftBlueprint } from './blueprints/raft.json'
import { raftFromJson } from './blueprints/raft-io'
import { hideRaftWires, showRaftWires } from './gfx/raft-wires-overlay'
export const RAFT_MAX_RAD = 3

export let raft: Raft
export function resetRaftBuild(context: SeaBlock, blueprint?: RaftBlueprint): void {
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
  raftFromJson(blueprint ?? testRaft as RaftBlueprint)
}

// export function updateRaftBuild(_context: GameUpdateContext): void {
//   raft.update()
// }

export class Raft {
  public cameraDistance: number = 10
  public currentPhase: RaftPhase = 'idle'

  protected waveMaker: ChessWaveMaker // Replace 'any' with actual type if available

  public readonly grid: TiledGrid
  public readonly hlTiles = new RaftHlTiles() // Highlighted tiles (raft-specific)
  public readonly raftTiles: Set<number>
  public readonly raftPieces: Array<RenderablePiece> = []
  public readonly thrusters: Array<AutoThruster> = []
  public readonly buttons: Array<RaftButton> = []

  public readonly centerPos: Vector3 = new Vector3()

  constructor(
    public readonly context: SeaBlock,
    public readonly centerTile: TileIndex,
  ) {
    this.grid = context.terrain.grid.clone()
    this.getPosOnTile(centerTile, this.centerPos)

    // buildingRaftGroup.position.copy(this.centerPos)
    // drivingRaftGroup.setRotationFromEuler(new Euler())
    drivingRaftGroup.position.copy(this.centerPos)
    // drivingRaftGroup.setRotationFromEuler(new Euler())

    // this.moveMeshesTo(buildingRaftGroup) // in case previously driving raft
    Object.values(instancedPieceMeshes).forEach((im) => {
      im.position.set(0, 0, 0)
      im.count = 0
    })
    this.waveMaker = new ChessWaveMaker(context.sphereGroup.members[0], context)
    this.raftTiles = new Set([centerTile.i])

    // cockpit position in group is always 0,0,0
    const cockpit: UniquePiece = {
      raft: this,
      mesh: cockpitMesh,
      tile: centerTile,
      type: 'cockpit',
    }
    this.raftPieces.push(cockpit)

    // // should be same as blueprints/test-raft.json
    // this._buildTestFloor()
    // this._buildTestThrusters()
    // this._buildTestButtons()
  }

  private _buildTestFloor() {
    const { centerTile } = this
    const rad = 2
    for (let dx = -rad; dx <= rad; dx++) {
      for (let dz = -rad; dz <= rad; dz++) {
        // if (dx === 0 && dz === 0) {
        //   continue // skip center tile
        // }
        const tile = this.grid.xzToIndex(centerTile.x + dx, centerTile.z + dz)
        if (tile) {
          this.buildPiece('floor', tile)
        }
      }
    }
  }

  // place three thrusters pointing down
  private _buildTestThrusters() {
    const { centerTile } = this
    const dx = -3

    for (const dz of ([2, 0, -2])) {
      const tile = this.grid.xzToIndex(centerTile.x + dx, centerTile.z + dz)
      if (tile) {
        this.buildPiece('thruster', tile)
      }
    }
  }

  private _buildTestButtons() {
    const [left, center, right] = this.thrusters
    this._addButton(1, 0, [center])
    this._addButton(0, 1, [right])
    this._addButton(0, -1, [left])
  }

  private _addButton(dx, dz, triggers) {
    const { centerTile } = this
    const tile = this.grid.xzToIndex(centerTile.x + dx, centerTile.z + dz)
    if (tile) {
      this.buildPiece('button', tile, triggers)
    }
  }

  // update() {
  //   this.moveMeshesTo(buildingRaftGroup) // in case previously driving raft
  //   //this.hlTiles.updateBuildableTiles(this)
  // }

  hoverWorld(inputEvent: ProcessedSubEvent): boolean {
    const { pickedTile } = inputEvent

    if (pickedTile) {
      return true // consume event
    }
    return false
  }

  getPiecesOnTile(tile: TileIndex): Array<RenderablePiece> {
    const result: Array<RenderablePiece> = []
    for (const piece of this.raftPieces) {
      if (piece.tile.i === tile.i) {
        result.push(piece)
      }
    }
    return result
  }

  getRelevantPiece(tileIndex: TileIndex): RenderablePiece | undefined {
    const occupants = this.getPiecesOnTile(tileIndex)

    // de-prioritize floor tile
    if (occupants.length > 1 && occupants[0].type === 'floor') {
      return occupants[1]
    }
    else if (occupants.length === 1) {
      return occupants[0]
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

  buildPiece(pieceName: PlaceablePieceName, tile: TileIndex, triggers?: Array<AutoThruster>) {
    // add mesh instance and logical raft piece
    const spawned = registerInstancedPiece(this, pieceName, tile)
    this.raftTiles.add(tile.i)
    setPiecePosition(spawned, this.getPosOnTile(tile).sub(this.centerPos))
    this.raftPieces.push(spawned)

    if (pieceName === 'thruster') {
      // add new thruster to auto-thruster logic
      this.thrusters.push({
        dx: tile.x - this.centerTile.x,
        dz: tile.z - this.centerTile.z,
        imIndex: this.thrusters.length,
        pieceIndex: this.raftPieces.length - 1, // index of piece registered above
        direction: getThrusterDirection(spawned),
        isFiring: false,
      })
    }
    else if (pieceName === 'button') {
      if (!triggers) {
        throw new Error('raft button requires triggers')
      }
      // add new button to auto-thruster logic
      this.buttons.push({
        imIndex: this.buttons.length,
        pieceIndex: this.raftPieces.length - 1, // index of piece registered above
        dx: tile.x - this.centerTile.x,
        dz: tile.z - this.centerTile.z,
        triggers, // : [...this.thrusters],
        isPressed: false,
      })
    }

    // this.hlTiles.updateBuildableTiles(this)
  }

  clickWorld(inputEvent: ProcessedSubEvent): boolean {
    const { pickedTile } = inputEvent

    if (pickedTile && this.hlTiles.clickable.has(pickedTile.i)) {
      // clicked buildable tile

      if (this.currentPhase.startsWith('place-')) {
      // spawn raft piece
        const pieceName = this.currentPhase.slice(6) as PlaceablePieceName
        this.buildPiece(pieceName, pickedTile)
        this.cancelBuild()
        return true // consume event
      }
    }
    return false
  }

  public editingButton: RaftButton | undefined = undefined
  public startPhase(phase: RaftPhase) {
    this.currentPhase = phase
    hidePieceDialog(this.context)
    showBuildPhasePanel(this.currentPhase)
    resetFrontLayer(this.context)

    if (phase === 'show-all-wires') {
      showRaftWires()
    }
    else {
      hideRaftWires()
    }
  }

  public cancelBuild() {
    this.currentPhase = 'idle'
    hideBuildPhasePanel()
    this.hlTiles.clear()
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
}

const positionDummy = new Vector3()
