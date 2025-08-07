/**
 * @file chess-helper.ts
 *
 * Chess logic functions referenced in chess-game and chess-gui.
 */

import { Vector3 } from 'three'
import { MeshLambertMaterial } from 'three'
import { Game, type GameUpdateContext } from '../game'
import type { SeaBlock } from 'sea-block'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { setTilePickY, type ProcessedSubEvent } from 'mouse-touch-input'
import { chessPieceMeshes, treasureChestMesh } from './chess-meshes'
import { ChessHlTiles } from './chess-hl-tiles'
import { ChessMoveAnim } from './chess-move-anim'
import type { ChessGui } from 'guis/imp/chess-gui'
import { flatViewport,
  leftRewardDisplay, rewardChoiceElements,
  rightRewardDisplay, showCurrentPiece, showPhaseLabel,
} from 'guis/imp/chess-gui'
import { PIECE_NAMES, type ChessPhase, type PieceName } from './chess-enums'
import { loadChessLevel, markLevelCompleted } from './levels/chess-level-parser'
import { playSound } from 'audio/sound-effects'
import type { ColoredInstancedMesh } from 'gfx/3d/colored-instanced-mesh'
import { buildGoalDiagram, buildMovesDiagram, buildRewardChoiceDiagram, renderFlatView } from './chess-diagrams'
import { Gui } from 'guis/gui'
import { COLLECTIBLES, randomCollectible } from './chess-rewards'
import type { FreeCamGame } from 'games/imp/free-cam-game'
import type { CollectibleName } from './levels/chess-levels.json.d'
import type { TilePosition } from 'core/grid-logic/tiled-grid'

// no 3D terrrain in background when selecting reward
export function chessAllow3DRender(): boolean {
  return instance.currentPhase !== 'reward-choice'
}

let resetQueued = true
export function resetChess(context: SeaBlock): void {
  const freeCam = Game.create('free-cam', context) as FreeCamGame
  freeCam.reset(context)

  if (resetQueued) {
    resetQueued = false
    instance = new Chess(context)
  }
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

export type RenderablePiece = {
  readonly instancedMesh: ColoredInstancedMesh
  readonly index: number
  type: PieceName
  tile: TileIndex
}

const positionDummy = new Vector3()

// state of rogeulike game run
type ChessRun = {
  collectedPawns: number
  collected: Array<CollectibleName>
  completedLevels: Array<number>
}
export const chessRun: ChessRun = {
  collectedPawns: 0,
  collected: [...PIECE_NAMES], // history of collected rewards
  completedLevels: [],
}

// one speicfic 5x5 puzzle bozrd
export class Chess {
  public lastHoveredTile?: TileIndex
  public readonly hlTiles: ChessHlTiles

  public readonly availablePieces: Array<PieceName> = []

  public currentPiece: RenderablePiece
  public readonly centerTile: TileIndex
  public readonly centerPos: TilePosition
  public readonly goalTile: TileIndex

  public readonly spawnedPawns: Array<RenderablePiece> = []

  public currentPhase: ChessPhase = 'player-choice'
  public currentMove?: ChessMoveAnim

  public leftReward: CollectibleName = randomCollectible(this)
  public rightReward: CollectibleName = randomCollectible(this)

  constructor(
    public readonly context: SeaBlock,
  ) {
    // this.currentPieceType = context.config.flatConfig.chessPieceType
    const { orbitControls, terrain } = context

    const chessGui = Gui.create('chess') as ChessGui
    chessGui.setChessInstance(this)

    this.hlTiles = new ChessHlTiles(terrain)

    // find center tile based on camera target
    const { target } = orbitControls
    const { x, z } = target
    const coord = terrain.grid.positionToCoord(x, z)
    const center = terrain.grid.xzToIndex(coord.x, coord.z)
    if (!center) {
      throw new Error(`could not find center tile at position ${x.toFixed(2)},${z.toFixed(2)}`)
    }

    // make sure camera taret is exactly on center of tile
    const exact = terrain.grid.indexToPosition(center)
    this.centerPos = exact
    this.centerCameraOnChessBoard()
    // this.hlTiles.set(center, 'center')
    // terrain.gfxHelper.setColorsForTile(centerColors, center)
    this.centerTile = center
    const { playerPiece, playerTile, goalTile } = loadChessLevel(this)
    this.goalTile = goalTile

    // reset instance counts and setup current piece mesh
    const currentPiece = this.resetMeshes(playerPiece.type, playerTile)

    if (!currentPiece) {
      throw new Error('no current piece mesh')
    }

    this.currentPiece = currentPiece

    // place player and goal based on parsed level
    treasureChestMesh.position.copy(this.getPosOnTile(goalTile))
    this.setPiecePosition(this.currentPiece, this.getPosOnTile(playerTile))
    this.hlTiles.updateAllowedMoves(this)

    // build help diagrams
    buildGoalDiagram(playerPiece.type)
    buildMovesDiagram(playerPiece.type)
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

  private centerCameraOnChessBoard() {
    const { orbitControls } = this.context
    const { target } = orbitControls
    const { x, z } = this.centerPos
    console.log(`chess-helper exact center pos: ${x},${z}`)
    target.x = x
    target.z = z
    target.y = 12
    orbitControls.update()
  }

  private resetMeshes(playerPieceType: PieceName, playerTile: TileIndex): RenderablePiece | undefined {
    const { target } = this.context.orbitControls

    let currentPiece: RenderablePiece | undefined
    const mat = new MeshLambertMaterial({ color: 0x333333 })
    for (const pieceType in chessPieceMeshes) {
      const mesh = chessPieceMeshes[pieceType] as ColoredInstancedMesh
      mesh.count = 0
      mesh.visible = false
      // mesh.position.copy(target)
      // mesh.position.x -= 0.5
      // mesh.position.y += 2
      // mesh.position.z -= 0.5
      mesh.material = mat
      if (pieceType === playerPieceType) {
        currentPiece = this.registerPiece(pieceType as PieceName, playerTile)
        showCurrentPiece(pieceType as PieceName)
      }
    }
    return currentPiece
  }

  public startPlacePawn() {
    this.currentPhase = 'place-pawn'
    this.hlTiles.updateAllowedMoves(this)
  }

  private registerPiece(type: PieceName, tile: TileIndex): RenderablePiece {
    const instancedMesh = chessPieceMeshes[type]
    if (!instancedMesh) {
      throw new Error(`missing mesh for ches piece ${type}`)
    }
    const index = instancedMesh.count
    instancedMesh.count++
    instancedMesh.visible = true
    return { instancedMesh, index, tile, type }
  }

  public update(context: GameUpdateContext) {
    const { hlTiles, currentPiece } = this
    const { terrain } = context.seaBlock

    this.centerCameraOnChessBoard()

    //
    setTilePickY(terrain.gfxHelper.liveRenderHeights[this.centerTile.i])

    hlTiles.update()
    showPhaseLabel(this.currentPhase)
    if (this.currentMove) {
      const isFinished = this.currentMove.update(context.dt)
      if (isFinished) {
        this.currentMove = undefined
        this.currentPhase = 'player-choice'
        this.setPiecePosition(currentPiece, this.getPosOnTile(currentPiece.tile))

        // check if landed on treasure chest
        if (currentPiece.tile.i === this.goalTile.i) {
          markLevelCompleted() // prevent level from loading again
          playSound('chessCelebrate')

          this.context.startTransition(() => {
            this.currentPhase = 'reward-choice'
            buildRewardChoiceDiagram(leftRewardDisplay, this.leftReward)
            buildRewardChoiceDiagram(rightRewardDisplay, this.rightReward)
            for (const elem of rewardChoiceElements) {
              elem.display.isVisible = true
            }
          })

          // currentLevelIndex++
          // this.context.onGameChange()

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
        this.setPiecePosition(this.currentPiece, pos)
      }
    }

    this.updateFlatView()
  }

  private updateFlatView() {
    // if( this.context.config.flatConfig.chessViewMode === '2D' ){

    renderFlatView(this)
    // }
  }

  public collectReward(name: CollectibleName) {
    chessRun.collected.push(name) // add to history
    const { collectAction } = COLLECTIBLES[name]
    if (collectAction) {
      collectAction(this) // do item-specific action (chess-rewards.ts)
    }

    resetQueued = true
    this.context.startTransition(() => {
      for (const elem of rewardChoiceElements) {
        elem.display.isVisible = false
      }
      resetChess(this.context)
      this.context.onGameChange()
    })
  }

  public switchCurrentPiece() {
    const i = PIECE_NAMES.indexOf(this.currentPiece.type)

    const n = PIECE_NAMES.length
    for (let di = 1; di < n; di++) {
      const j = (i + di) % n
      const candidate = PIECE_NAMES[j]
      if (candidate === 'pawn') {
        continue // pawn is not playable
      }
      if (chessRun.collected.includes(candidate)) {
        this.currentPiece.type = candidate
        break
      }
    }

    const currentPiece = this.resetMeshes(this.currentPiece.type, this.currentPiece.tile)
    if (!currentPiece) {
      throw new Error('no current piece mesh')
    }
    this.currentPiece = currentPiece
    this.setPiecePosition(this.currentPiece, this.getPosOnTile(this.currentPiece.tile))
    this.hlTiles.updateAllowedMoves(this)
    showCurrentPiece(this.currentPiece.type)
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
      if (this.currentPhase === 'player-choice') {
        this.movePlayerToTile(clickedTile)
      }
      else {
        // should spawn pawn
        const mesh = chessPieceMeshes.pawn
        if (!mesh) {
          throw new Error('missing pawn mesh')
        }
        const spawned = this.registerPiece('pawn', clickedTile)
        this.spawnedPawns.push(spawned)
        this.setPiecePosition(spawned, this.getPosOnTile(clickedTile))
        this.currentPhase = 'player-choice'
        this.hlTiles.updateAllowedMoves(this)
      }
    }
  }

  private movePlayerToTile(clickedTile: TileIndex) {
    // start move phase
    const oldTile = this.currentPiece.tile
    const startPos = this.getPosOnTile(oldTile).clone()
    const endPos = this.getPosOnTile(clickedTile).clone()
    this.currentMove = new ChessMoveAnim(startPos, endPos)
    this.currentPhase = 'player-anim'

    playSound('chessPlonk')

    // highlight new tile already
    this.currentPiece.tile = clickedTile
    this.hlTiles.updateAllowedMoves(this)
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
    if (inputEvent.seaBlock.config.flatConfig.chessViewMode === '2D') {
      const flatTile = this.pickTileInFlatView(inputEvent)

      if (flatTile) {
      // hover 2d tile
        return this._hoverTile(flatTile)
      }
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
    instancedMesh.frustumCulled = false
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
    writeTo.set(x, 12, z)

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
