/**
 * @file chess-helper.ts
 *
 * Chess logic functions referenced in chess-game and chess-gui.
 */

import { Color, Vector3 } from 'three'
import { MeshLambertMaterial } from 'three'
import { Game, type GameUpdateContext } from '../game'
import type { SeaBlock } from 'sea-block'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { setTilePickY, type ProcessedSubEvent } from 'mouse-touch-input'
import { chessPieceMeshes, treasureChestElement, treasureChestMesh } from './chess-meshes'
import { ChessHlTiles } from './chess-hl-tiles'
import { ChessMoveAnim } from './chess-move-anim'
import type { ChessGui } from 'guis/imp/chess-gui'
import { flatViewport,
  goalDisplays,
  leftRewardDisplay,
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
import { buildPawnMoves, buildEnemyMoves, nextPhasePickers } from './chess-sequences'
import { Transition } from 'gfx/transitions/transition'
import { freeCamPipeline } from 'gfx/3d/tile-render-pipeline/free-cam-pipeline'
import type { Pipeline } from 'gfx/3d/tile-render-pipeline/pipeline'
import { chessBoardPipeline } from 'gfx/3d/tile-render-pipeline/chess-board-pipeline'

const enemyColor = new Color(0xff0000)

// clicking chest mesh counts as clicking its tile
treasureChestElement.clickAction = () => {
  instance.clickTile(instance.goalTile)
}

// no 3D terrrain in background when selecting reward
export function chessAllow3DRender(): boolean {
  if (instance.currentPhase === 'reward-choice') {
    return false
  }
  if (chessRun.collected.includes('dual-vector-foil')) {
    return false
  }
  return true
}

export function clearChessRun(): void {
  isResetQueued = true
  chessRun.collected = [...START_COLLECTED]
}

let isResetQueued = true
export function resetChess(context: SeaBlock): void {
  // get freecam game just to call reset
  const freeCam = Game.create('free-cam', context) as FreeCamGame
  freeCam.reset(context)

  if (isResetQueued) {
    isResetQueued = false
    instance = new Chess(context)
  }
  chessBoardPipeline.setHlTiles(instance.hlTiles)
}

export function getChessPipeline(tile: TileIndex): Pipeline {
  if (instance && instance.boardTiles.includes(tile.i)) {
    return chessBoardPipeline
  }
  return freeCamPipeline
}

export function getChessPhase() {
  const result = instance?.currentPhase || 'player-choice'
  console.log('get ches sphase', result, instance)
  return result
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
  isEnemy: boolean
}

const positionDummy = new Vector3()

// state of current rogeulike game run
type ChessRun = {
  hasSwitchedPiece: boolean
  hasPlacedPawn: boolean
  collectedPawns: number
  collected: Array<CollectibleName>
  completedLevels: Array<number>
}

const START_COLLECTED = [
  ...PIECE_NAMES,
] as const satisfies Array<CollectibleName>

export const chessRun: ChessRun = {
  hasSwitchedPiece: false,
  hasPlacedPawn: false,
  collectedPawns: 0,
  collected: [...START_COLLECTED], // history of collected rewards
  completedLevels: [],
}

// state of current level in run, (one specific 5x5 puzzle board)
export class Chess {
  public lastHoveredTile?: TileIndex
  public readonly hlTiles: ChessHlTiles

  public readonly centerTile: TileIndex
  public readonly centerPos: TilePosition
  public readonly boardTiles: Array<number>
  public readonly goalTile: TileIndex

  // visible pieces on board
  public player!: RenderablePiece
  public readonly pawns: Array<RenderablePiece> = []
  public readonly enemies: Array<RenderablePiece> = []

  public currentPhase: ChessPhase = 'player-choice'
  public currentMove?: ChessMoveAnim

  private pawnMoves: Array<ChessMoveAnim | null> = [] // set at start of pawn-anim
  private enemyMoves: Array<ChessMoveAnim | null> = [] // set at start of enemy-anim

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
    // this.centerCameraOnChessBoard(0)
    // this.hlTiles.set(center, 'center')
    // terrain.gfxHelper.setColorsForTile(centerColors, center)
    this.centerTile = center
    const { playerPiece, enemyPieces, boardTiles, goalTile } = loadChessLevel(this)
    this.boardTiles = boardTiles
    this.goalTile = goalTile

    // reset instance counts and setup current piece mesh
    this.resetMeshes(playerPiece.type, playerPiece.tile, enemyPieces)

    // place player and goal based on parsed level
    treasureChestMesh.position.copy(this.getPosOnTile(goalTile))
    this.hlTiles.updateAllowedMoves(this)

    // build help diagrams
    buildGoalDiagram(playerPiece.type)
    buildMovesDiagram(playerPiece.type)
    this.updateFlatView()
    flatViewport.clickAction = ({ inputEvent }) => {
      if ('lvPos' in inputEvent && chessRun.collected.includes('dual-vector-foil')) {
        const tile = this.pickTileInFlatView(inputEvent)
        if (tile) {
          this.clickTile(tile)
        }
      }
    }
  }

  private centerCameraOnChessBoard(dt: number) {
    const { orbitControls } = this.context
    const { target } = orbitControls
    const { x, z } = this.centerPos
    target.x = x
    target.z = z
    target.y = 12

    // // Desired offset from target (orbit radius and angles)
    // const desiredOffset = new Vector3(0, 5, 5)

    // // Use helper to smoothly lerp camera position
    // lerpCameraSpherical(this.context.camera, target, desiredOffset, dt)

    orbitControls.update()
  }

  private resetMeshes(playerPieceType: PieceName, playerTile: TileIndex,
    enemies: Array<{ type: PieceName, tile: TileIndex }>,
  ) {
    this.enemies.length = 0 // clear existing registered enemy meshes
    const mat = new MeshLambertMaterial({ color: 0x333333 })
    for (const pieceType in chessPieceMeshes) {
      const mesh = chessPieceMeshes[pieceType] as ColoredInstancedMesh
      mesh.count = 0
      mesh.visible = true
      mesh.material = mat
      if (pieceType === playerPieceType) {
        // register player
        this.player = this.registerPiece(pieceType as PieceName, playerTile, false)
        showCurrentPiece(pieceType as PieceName)
      }
      // register enemies for this type of chess piece
      this.enemies.push(...enemies
        .filter(nme => nme.type === pieceType)
        .map(({ type, tile }) => this.registerPiece(type, tile, true)),
      )
    }
    if (!this.player) {
      throw new Error('no player piece mesh')
    }

    // set positions for visible mesh instances
    this.setPiecePosition(this.player, this.getPosOnTile(this.player.tile))
    for (const nme of this.enemies) {
      this.setPiecePosition(nme, this.getPosOnTile(nme.tile))
      nme.instancedMesh.setInstanceColor(nme.index, enemyColor)
    }
  }

  public startPlacePawn() {
    this.currentPhase = 'place-pawn'
    this.hlTiles.updateAllowedMoves(this)
  }

  private registerPiece(type: PieceName, tile: TileIndex, isEnemy: boolean): RenderablePiece {
    const instancedMesh = chessPieceMeshes[type]
    if (!instancedMesh) {
      throw new Error(`missing mesh for ches piece ${type}`)
    }
    const index = instancedMesh.count
    instancedMesh.count++
    instancedMesh.visible = true
    return { instancedMesh, index, tile, type, isEnemy }
  }

  private pickNextPhase(): ChessPhase {
    const result = nextPhasePickers[this.currentPhase](this)

    if (result === 'pawn-anim') {
      this.pawnMoves = buildPawnMoves(this)
    }
    if (result === 'enemy-anim') {
      this.enemyMoves = buildEnemyMoves(this)
    }

    return result
  }

  public update(context: GameUpdateContext) {
    const { hlTiles, player: currentPiece } = this
    const { terrain } = context.seaBlock

    // update gui animation
    const frameIndex = Math.floor(performance.now() / 500) % 2

    for (const [i, display] of goalDisplays.entries()) {
      display.isVisible = (i === frameIndex)
      display.needsUpdate = true
    }

    this.centerCameraOnChessBoard(context.dt)

    //
    const centerHeight = terrain.gfxHelper.getLiveHeight(this.centerTile)
    if (typeof centerHeight === 'number') setTilePickY(centerHeight)

    hlTiles.update()
    showPhaseLabel(this.currentPhase)

    if (this.currentPhase === 'player-anim') {
      if (this.currentMove) {
        const isFinished = this.currentMove.update(context.dt)
        if (isFinished) {
          this.currentMove = undefined
          this.currentPhase = this.pickNextPhase()
          this.setPiecePosition(currentPiece, this.getPosOnTile(currentPiece.tile))

          // check if landed on treasure chest
          if (currentPiece.tile.i === this.goalTile.i) {
            markLevelCompleted() // prevent level from loading again
            playSound('chessCelebrate')

            this.context.startTransition({
              transition: Transition.create('checkered', this.context),
              callback: () => {
                this.currentPhase = 'reward-choice'
                this.context.game.gui.refreshLayout(this.context)
                buildRewardChoiceDiagram(leftRewardDisplay, this.leftReward)
                buildRewardChoiceDiagram(rightRewardDisplay, this.rightReward)
              },
            })
          }
          else {
          // playSound('chessPlonk')
          }
        }
        else {
          const pos = this.currentMove.getLivePosition()
          this.setPiecePosition(this.player, pos)
        }
      }
      else {
        // somehow in player-anim phase but no currentMove
        this.currentPhase = this.pickNextPhase()
      }
    }
    else if (this.currentPhase === 'pawn-anim') {
      // find first non-null unfinished move
      const i = this.pawnMoves.findIndex(move => move && !move.isFinished)
      if (i >= 0) {
        const piece = this.pawns[i]
        const move = this.pawnMoves[i] as ChessMoveAnim
        const isFinished = move.update(context.dt)
        this.setPiecePosition(piece, move.getLivePosition())
        if (isFinished) {
          piece.tile = move.endTile // update logical tile
        }
      }
      else {
        // no pawn moves remaining
        this.currentPhase = this.pickNextPhase()
      }
    }
    else if (this.currentPhase === 'enemy-anim') {
      // find first non-null unfinished move
      const i = this.enemyMoves.findIndex(move => move && !move.isFinished)
      if (i >= 0) {
        const piece = this.enemies[i]
        const move = this.enemyMoves[i] as ChessMoveAnim
        const isFinished = move.update(context.dt)
        this.setPiecePosition(piece, move.getLivePosition())
        if (isFinished) {
          piece.tile = move.endTile // update logical tile
        }
      }
      else {
        // no enemy moves remaining
        this.currentPhase = this.pickNextPhase()
      }
    }

    this.updateFlatView()
  }

  private updateFlatView() {
    // if( this.context.config.flatConfig.chessViewMode === '2D' ){
    if (chessRun.collected.includes('dual-vector-foil')) {
      renderFlatView(this)
    }
    else {
      flatViewport.display.isVisible = false
    }
  }

  public collectReward(name: CollectibleName) {
    console.log(`collect reward ${name}`)

    chessRun.collected.push(name) // add to history
    const { collectAction } = COLLECTIBLES[name]
    if (collectAction) {
      collectAction(this) // do item-specific action (chess-rewards.ts)
    }

    isResetQueued = true
    this.context.startTransition({
      transition: Transition.create('checkered', this.context),
      callback: () => {
        resetChess(this.context)
        this.context.onGameChange()
      },
    })
  }

  public switchCurrentPiece() {
    const i = PIECE_NAMES.indexOf(this.player.type)

    const n = PIECE_NAMES.length
    for (let di = 1; di < n; di++) {
      const j = (i + di) % n
      const candidate = PIECE_NAMES[j]
      if (candidate === this.player.type) {
        continue // same as current
      }
      if (candidate === 'pawn') {
        continue // pawn is not playable
      }
      if (chessRun.collected.includes(candidate)) {
        chessRun.hasSwitchedPiece = true
        this.player.type = candidate
        break
      }
    }

    this.resetMeshes(this.player.type, this.player.tile, this.enemies)
    this.hlTiles.updateAllowedMoves(this)
    showCurrentPiece(this.player.type)
  }

  public click(inputEvent: ProcessedSubEvent): boolean {
    // if (inputEvent.seaBlock.config.flatConfig.chessViewMode === '2D') {
    if (chessRun.collected.includes('dual-vector-foil')) {
      const flatTile = this.pickTileInFlatView(inputEvent)

      if (flatTile) {
        // click 2d tile
        this.clickTile(flatTile)
        return true // consume event
      }
    }

    // check picked 3D terrain tile from event
    const { pickedTile: pickedTileIndex } = inputEvent
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
      else if (this.currentPhase === 'place-pawn') {
        // spawn pawn
        chessRun.hasPlacedPawn = true
        const mesh = chessPieceMeshes.pawn
        if (!mesh) {
          throw new Error('missing pawn mesh')
        }
        const spawned = this.registerPiece('pawn', clickedTile, false)
        this.pawns.push(spawned)
        this.setPiecePosition(spawned, this.getPosOnTile(clickedTile))
        this.currentPhase = this.pickNextPhase()
        this.hlTiles.updateAllowedMoves(this)
      }
    }
  }

  private movePlayerToTile(clickedTile: TileIndex) {
    // start move phase
    const oldTile = this.player.tile
    const startPos = this.getPosOnTile(oldTile).clone()
    const endPos = this.getPosOnTile(clickedTile).clone()
    this.currentMove = new ChessMoveAnim(startPos, endPos, clickedTile)
    this.currentPhase = 'player-anim'

    playSound('chessPlonk')

    // highlight new tile already
    this.player.tile = clickedTile
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
    // if (inputEvent.seaBlock.config.flatConfig.chessViewMode === '2D') {
    if (chessRun.collected.includes('dual-vector-foil')) {
      const flatTile = this.pickTileInFlatView(inputEvent)

      if (flatTile) {
      // hover 2d tile
        return this._hoverTile(flatTile)
      }
    }

    // hover 3d tile
    return this._hoverTile(inputEvent.pickedTile)
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

  public getPieceOnTile(tile: TileIndex): RenderablePiece | undefined {
    const { i } = tile
    if (this.player.tile.i === i) {
      return this.player
    }
    for (const pawn of this.pawns) {
      if (pawn.tile.i === i) {
        return pawn
      }
    }
    for (const enemy of this.enemies) {
      if (enemy.tile.i === i) {
        return enemy
      }
    }
    return undefined // tile is not occupied
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
