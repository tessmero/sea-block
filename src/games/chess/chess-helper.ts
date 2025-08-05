/**
 * @file chess-helper.ts
 *
 * Chess logic functions referenced in chess-game and chess-gui.
 */

import { Vector3 } from 'three'
import { MeshLambertMaterial } from 'three'
import type { GameUpdateContext } from '../game'
import type { SeaBlock } from 'sea-block'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { setTilePickY, type ProcessedSubEvent } from 'mouse-touch-input'
import { chessPieceMeshes, treasureChestMesh } from './chess-meshes'
import { ChessHlTiles } from './chess-hl-tiles'
import { ChessMoveAnim } from './chess-move-anim'
import { flatViewport, showPhaseLabel } from 'guis/imp/chess-gui'
import type { ChessPhase, PieceName } from './chess-enums'
import { loadChessLevel } from './levels/chess-level-parser'
import { playSound } from 'audio/sound-effects'
import type { ColoredInstancedMesh } from 'gfx/3d/colored-instanced-mesh'
import { buildGoalDiagram, buildMovesDiagram, renderFlatView } from './chess-diagrams'

export function resetChess(context: SeaBlock): void {
  instance = new Chess(context)
}

export function updateChess(context: GameUpdateContext): void {
  instance.update(context)
}

export function clickChess(inputEvent: ProcessedSubEvent): boolean {
  return instance.click(inputEvent)
}

export function moveChess(inputEvent: ProcessedSubEvent): boolean {
  return instance.move(inputEvent)
}

let instance: Chess

let currentLevelIndex = 0

export type RenderablePiece = {
  readonly instancedMesh: ColoredInstancedMesh
  readonly index: number
}

const positionDummy = new Vector3()

export class Chess {
  public lastHoveredTile?: TileIndex
  public readonly hlTiles: ChessHlTiles

  public readonly currentPieceType: PieceName
  public readonly currentPieceMesh: RenderablePiece
  public readonly centerTile: TileIndex
  public readonly goalTile: TileIndex
  public currentPieceTile: TileIndex

  public currentPhase: ChessPhase = 'player-choice'
  public currentMove?: ChessMoveAnim

  constructor(
    public readonly context: SeaBlock,
  ) {
    // this.currentPieceType = context.config.flatConfig.chessPieceType
    const { orbitControls, terrain } = context

    this.hlTiles = new ChessHlTiles(terrain)

    // find center tile
    const { target } = orbitControls
    target.x = Math.ceil(target.x) - 0.5
    target.z = Math.ceil(target.z) - 0.5
    target.y = 12
    orbitControls.update()
    const { x, z } = target
    const coord = terrain.grid.positionToCoord(x, z)
    const center = terrain.grid.xzToIndex(coord.x, coord.z)
    if (!center) {
      throw new Error(`could not find center tile at position ${x.toFixed(2)},${z.toFixed(2)}`)
    }
    // this.hlTiles.set(center, 'center')
    // terrain.gfxHelper.setColorsForTile(centerColors, center)
    const { playerPiece, playerTile, goalTile } = loadChessLevel(currentLevelIndex, terrain, center)
    this.goalTile = goalTile
    this.currentPieceType = playerPiece.type

    // reset instance counts and setup current piece mesh
    let currentPieceMesh: RenderablePiece | undefined
    for (const pieceType in chessPieceMeshes) {
      const mesh = chessPieceMeshes[pieceType] as ColoredInstancedMesh
      mesh.count = 0
      if (pieceType === this.currentPieceType) {
        mesh.material = new MeshLambertMaterial({ color: 0x333333 })
        mesh.position.copy(target)
        mesh.position.x += 0.5
        // mesh.position.y += 2
        mesh.position.z += 0.5
        mesh.visible = true
        currentPieceMesh = this.registerPiece(mesh)
      }
      else {
        mesh.visible = false // not current piece
      }
    }

    if (!currentPieceMesh) {
      throw new Error('now current piece mesh')
    }

    this.currentPieceMesh = currentPieceMesh
    this.centerTile = center
    this.currentPieceTile = playerTile

    // place player and goal based on parsed level
    treasureChestMesh.position.copy(this.getPosOnTile(goalTile))
    this.setPiecePosition(this.currentPieceMesh, this.getPosOnTile(playerTile))
    this.hlTiles.updateAllowedMoves(this.currentPieceTile, this.currentPieceType)

    // build help diagrams
    buildGoalDiagram()
    buildMovesDiagram()
    this.updateFlatView()
    flatViewport.clickAction = ({ inputEvent }) => {
      if ('lvPos' in inputEvent) { // layered viewport position
        const tile = this.pickTileInFlatView(inputEvent)
        if (tile) {
          this.clickTile(tile)
        }
      }
    }
  }

  private registerPiece(instancedMesh: ColoredInstancedMesh): RenderablePiece {
    const index = instancedMesh.count
    instancedMesh.count++
    return { instancedMesh, index }
  }

  public update(context: GameUpdateContext) {
    const { hlTiles, currentPieceMesh, currentPieceTile } = this
    const { terrain } = context.seaBlock

    //
    setTilePickY(terrain.gfxHelper.liveRenderHeights[this.centerTile.i])

    hlTiles.update()
    showPhaseLabel(this.currentPhase)
    if (this.currentMove) {
      const isFinished = this.currentMove.update(context.dt)
      if (isFinished) {
        this.currentMove = undefined
        this.currentPhase = 'player-choice'
        this.setPiecePosition(currentPieceMesh, this.getPosOnTile(currentPieceTile))

        // check if landed on treasure chest
        if (currentPieceTile.i === this.goalTile.i) {
          playSound('chessCelebrate')

          currentLevelIndex++
          this.context.onGameChange()

          // const item = this.context.config.tree.children.game
          // item.value = 'free-cam'
          // this.context.onCtrlChange(item)
        }
        else {
          // playSound('chessPlonk')
        }
      }
      else {
        const pos = this.currentMove.getLivePosition()
        this.setPiecePosition(this.currentPieceMesh, pos)
      }
    }

    this.updateFlatView()
  }

  private updateFlatView() {
    // if( this.context.config.flatConfig.chessViewMode === '2D' ){

    renderFlatView(this)
    // }
  }

  public click(inputEvent: ProcessedSubEvent): boolean {
    // click is NOT in flat chessboard viewport (gui would have consumed it)

    // check picked 3D terrain tile from event
    const { pickedTileIndex } = inputEvent
    // const clickedTile = this.getNearestValidMove(pickedTileIndex)
    // if (!clickedTile) {
    //   return false // do not consume event
    // }
    const clickedTile = pickedTileIndex
    if (!clickedTile || !this.hlTiles.allowedMoves.has(clickedTile.i)) {
      return false // do not consume event
    }

    this.clickTile(clickedTile)
    return true // consume event
  }

  public clickTile(clickedTile: TileIndex) {
    // check if can move to clicked tile
    if (this.hlTiles.allowedMoves.has(clickedTile.i)) {
      // start move phase
      const oldTile = this.currentPieceTile
      const startPos = this.getPosOnTile(oldTile).clone()
      const endPos = this.getPosOnTile(clickedTile).clone()
      this.currentMove = new ChessMoveAnim(startPos, endPos)
      this.currentPhase = 'player-anim'

      playSound('chessPlonk')

      // highlight new tile already
      this.currentPieceTile = clickedTile
      this.hlTiles.updateAllowedMoves(this.currentPieceTile, this.currentPieceType)
    }
  }

  private pickTileInFlatView(inputEvent: ProcessedSubEvent): TileIndex | undefined {
    const { lvPos } = inputEvent
    const { gui } = inputEvent.seaBlock.game

    // check if hovering flat view
    if (lvPos) {
      const layoutKey = 'flatViewport'
      const rectangle = gui.overrideLayoutRectangles[layoutKey] || gui.layoutRectangles[layoutKey]
      if (rectangle) {
        // compute point in units of flat view tiles
        const { x, y } = rectangle
        const col = (lvPos.x - x) / 16
        const row = (lvPos.y - y) / 16
        if (col > 0 && col < 5 && row > 0 && row < 5) {
          // point is inside flat view
          const tile = this.context.terrain.grid.xzToIndex(
            Math.floor(this.centerTile.x + col - 2),
            Math.floor(this.centerTile.z + row - 2),
          )
          return tile
        }
      }
    }
  }

  public move(inputEvent: ProcessedSubEvent) {
    const flatTile = this.pickTileInFlatView(inputEvent)

    if (flatTile) {
      // hover 2d tile
      return this._hoverTile(flatTile)
    }

    // hover 3d tile
    return this._hoverTile(inputEvent.pickedTileIndex)
  }

  private _hoverTile(tile?: TileIndex) {
    // tile = this.getNearestValidMove(tile)
    if (!tile || !this.hlTiles.allowedMoves.has(tile.i)) {
      tile = undefined
    }

    if (this.lastHoveredTile) {
      // this.context.terrain.gfxHelper.restoreColorsForTile(this.lastHoveredTile)
      this.hlTiles.clear(this.lastHoveredTile)
      this.lastHoveredTile = undefined
    }
    if (tile) {
      // this.context.terrain.gfxHelper.setTempColorsForTile(hoverColors, tile)
      this.hlTiles.set(tile, 'hover')
      this.lastHoveredTile = tile
      document.documentElement.style.cursor = 'pointer'
      // return true // consume event
    }
    return false // do not consume event
  }

  private setPiecePosition(mesh: RenderablePiece, position: Vector3): void {
    // console.log(`setpiecepos ${position.x.toFixed(2)}, ${position.z.toFixed(2)}`)

    const { instancedMesh, index } = mesh
    const posArray = instancedMesh.instanceMatrix.array

    // start of position in meshes arrays
    let offset = index * 16 + 12

    const { x, y, z } = position
    posArray[offset++] = x
    posArray[offset++] = y
    posArray[offset++] = z
    instancedMesh.instanceMatrix.needsUpdate = true
  }

  public getPiecePosition(mesh: RenderablePiece, target?: Vector3): Vector3 {
    const { instancedMesh, index } = mesh
    const posArray = instancedMesh.instanceMatrix.array

    const writeTo = target || positionDummy

    // start of position in meshes arrays
    let offset = index * 16 + 12
    writeTo.set(
      posArray[offset++],
      posArray[offset++],
      posArray[offset++],
    )
    return writeTo
  }

  public getPosOnTile(tile: TileIndex, target?: Vector3): Vector3 {
    const { x, z } = this.context.terrain.grid.indexToPosition(tile)

    const writeTo = target || positionDummy
    writeTo.set(x, 0, z)

    return writeTo
  }

  // private getNearestValidMove(tile?: TileIndex): TileIndex | undefined {
  //   if (!tile) {
  //     return undefined
  //   }
  //   let result: TileIndex | undefined = undefined
  //   let minD = Number.MAX_VALUE
  //   for (const i of this.hlTiles.allowedMoves) {
  //     const otherTile = this.context.terrain.grid.tileIndices[i]
  //     const dx = tile.x - otherTile.x
  //     const dz = tile.z - otherTile.z
  //     const d = dx * dx + dz * dz
  //     if (d < minD) {
  //       minD = d
  //       result = otherTile
  //     }
  //   }
  //   return result
  // }
}
