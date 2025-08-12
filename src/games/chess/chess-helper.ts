/**
 * @file chess-helper.ts
 *
 * Chess logic functions referenced in chess-game and chess-gui.
 */

import { Vector3 } from 'three'
import { GameElement, type GameUpdateContext } from '../game'
import { emptyScene, type SeaBlock } from 'sea-block'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { setTilePickY, type ProcessedSubEvent } from 'mouse-touch-input'
import type { RenderablePiece, UniquePiece } from './chess-3d-gfx-helper'
import { instancedPieceMeshes, resetMeshes, treasureChestElement, updateMeshes } from './chess-3d-gfx-helper'
import { ChessHlTiles } from './chess-hl-tiles'
import { ChessMoveAnim } from './chess-move-anim'
import type { ChessGui } from 'guis/imp/chess-gui'
import { PIECE_NAMES, type ChessPhase, type PieceName } from './chess-enums'
import { loadChessLevel } from './levels/chess-level-parser'
import { playSound } from 'audio/sound-effects'
import {
  buildGoalDiagram, buildMovesDiagram, flatChessBackground,
  renderFlatView, updatePawnButtonLabel,
} from './chess-2d-gfx-helper'
import { Gui } from 'guis/gui'
import { COLLECTIBLES, randomCollectible } from './chess-rewards'
import type { CollectibleName } from './levels/chess-levels.json.d'
import type { TilePosition } from 'core/grid-logic/tiled-grid'
import { buildPawnMoves, buildEnemyMoves, nextPhasePickers } from './chess-sequences'
import { Transition } from 'gfx/transitions/transition'
import { chessBoardPipeline } from 'gfx/3d/tile-render-pipeline/chess-board-pipeline'
import { chessRun, START_COLLECTED, START_PAWNS } from './chess-run'
import { SeamlessTransition } from 'gfx/transitions/imp/seamless-transition'
import { CAMERA } from 'settings'
import { cancelPawnBtn, flatViewport, goalDisplays, pawnBtn, showCurrentPiece } from './gui/chess-hud-elements'
import { toggleGameOverMenu, togglePauseMenu } from './gui/chess-dialog-elements'
import { showPhaseLabel } from './gui/chess-debug-elements'
import { updateChessPhase } from './chess-update-helper'
import { FREECAM_PLAYLIST, playNextTrack } from 'audio/song-playlist'
import { flatViewPortClick, flatViewPortUnclick, updateHeldChessInputs } from './chess-input-helper'
import { ChessWaveMaker } from './chess-wave-maker'

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
  chessRun.collectedPawns = START_PAWNS
  chessRun.collected = [...START_COLLECTED]
}

let isResetQueued = true
export function resetChess(context: SeaBlock): Chess {
  // // get freecam game just to call reset
  // const freeCam = Game.create('free-cam', context) as FreeCamGame
  // freeCam.reset(context)

  if (isResetQueued) {
    isResetQueued = false
    instance = new Chess(context)
  }
  chessBoardPipeline.setHlTiles(instance.hlTiles)

  return instance
}

export function quitChess(chess: Chess, seaBlock: SeaBlock): void {
  // reset ui to default state
  togglePauseMenu(seaBlock, false)
  toggleGameOverMenu(seaBlock, false)
  clearChessRun()

  // start transition
  const item = seaBlock.config.tree.children.game
  item.value = 'free-cam'
  SeamlessTransition.desiredCameraOffset.copy(CAMERA)
  SeamlessTransition.snapshotTerrain(seaBlock)
  for (const i of chess.boardTiles) {
    seaBlock.terrain.generatedTiles[i] = null
  }
  seaBlock.startTransition({
    transition: Transition.create('seamless', seaBlock),
    callback: () => {
      playNextTrack(FREECAM_PLAYLIST)
    },
  })
  seaBlock.onCtrlChange(item)
}

export function getChessPhase() {
  const result = instance?.currentPhase || 'player-choice'
  // console.log('get ches sphase', result, instance)
  return result
}

// used to implement chess-game
export function updateChess(context: GameUpdateContext): void {
  updateHeldChessInputs()
  instance.update(context)
}

let instance: Chess

const positionDummy = new Vector3()

// state of current level in run, (one specific 5x5 puzzle board)
export class Chess {
  protected waveMaker!: ChessWaveMaker

  public readonly hlTiles: ChessHlTiles

  public readonly centerTile: TileIndex
  public readonly centerPos: TilePosition
  public readonly boardTiles: Array<number>
  public readonly goalTile: TileIndex

  // visible pieces on board
  public player!: UniquePiece
  public playerElement!: GameElement
  public readonly pawns: Array<RenderablePiece> = []
  public readonly enemies: Array<RenderablePiece> = []

  public currentPhase: ChessPhase = 'player-choice'
  public currentMove?: ChessMoveAnim

  public pawnMoves: Array<ChessMoveAnim | null> = [] // set at start of pawn-anim
  public enemyMoves: Array<ChessMoveAnim | null> = [] // set at start of enemy-anim

  public leftReward: CollectibleName = randomCollectible(this)
  public rightReward: CollectibleName = randomCollectible(this)

  constructor(
    public readonly context: SeaBlock,
  ) {
    updatePawnButtonLabel()
    pawnBtn.display.isVisible = true
    cancelPawnBtn.display.isVisible = false
    pawnBtn.display.needsUpdate = true
    cancelPawnBtn.display.needsUpdate = true

    // this.currentPieceType = context.config.flatConfig.chessPieceType
    const { orbitControls, terrain } = context

    const chessGui = Gui.create('chess') as ChessGui
    chessGui.chess = this

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
    resetMeshes(this, playerPiece, [], enemyPieces)

    // place player and goal based on parsed level
    // treasureChestMesh.position.copy(this.getPosOnTile(goalTile))
    this.hlTiles.updateAllowedMoves(this)

    // build help diagrams
    buildGoalDiagram(playerPiece.type)
    buildMovesDiagram(playerPiece.type)
    this.updateFlatView()
    flatViewport.clickAction = ({ inputEvent }) => {
      flatViewPortClick(this, inputEvent as ProcessedSubEvent)
    }
    flatViewport.unclickAction = ({ inputEvent }) => {
      flatViewPortUnclick(this, inputEvent as ProcessedSubEvent)
    }

    // sphere to interact with water and make waves
    this.waveMaker = new ChessWaveMaker(context.sphereGroup.members[1])
  }

  private centerCameraOnChessBoard(_dt: number) {
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

  public startPlacePawn() {
    if (chessRun.collectedPawns <= 0) {
      playSound('chessCancel')
      return
    }

    buildGoalDiagram('pawn')
    this.currentPhase = 'place-pawn'
    this.hlTiles.updateAllowedMoves(this)
    pawnBtn.display.isVisible = false
    cancelPawnBtn.display.isVisible = true
    pawnBtn.display.needsUpdate = true
    cancelPawnBtn.display.needsUpdate = true
    this.context.layeredViewport.handleResize(this.context)
  }

  public cancelPlacePawn() {
    buildGoalDiagram(this.player.type)
    this.currentPhase = 'player-choice'
    this.hlTiles.updateAllowedMoves(this)
    pawnBtn.display.isVisible = true
    cancelPawnBtn.display.isVisible = false
    pawnBtn.display.needsUpdate = true
    cancelPawnBtn.display.needsUpdate = true
    this.context.layeredViewport.handleResize(this.context)
  }

  public gotoNextPhase(): ChessPhase {
    const result = nextPhasePickers[this.currentPhase](this)

    if (result === 'pawn-anim') {
      this.pawnMoves = buildPawnMoves(this)
    }
    if (result === 'enemy-anim') {
      this.enemyMoves = buildEnemyMoves(this)
    }

    this.currentPhase = result
    return result
  }

  public update(context: GameUpdateContext) {
    const { seaBlock, dt } = context
    const { terrain } = seaBlock

    // update gui animation
    const frameIndex = Math.floor(performance.now() / 500) % 2

    for (const [i, display] of goalDisplays.entries()) {
      display.isVisible = (i === frameIndex)
      display.needsUpdate = true
    }

    // update world
    this.waveMaker.updateWaveMaker(dt)
    this.centerCameraOnChessBoard(dt)

    // use goal tile as representative (should always be part of chess board)
    const centerHeight = terrain.gfxHelper.getLiveHeight(this.goalTile)
    if (typeof centerHeight === 'number') setTilePickY(centerHeight)

    // update color-coding of valid move tiles
    // hlTiles.update()

    // show text for debugging
    showPhaseLabel(this.currentPhase)

    // place meshes on logical tiles
    updateMeshes(this)

    // advance phase-specific animation (may override mesh positions)
    updateChessPhase({ ...context, chess: this })

    this.updateFlatView()
  }

  // used to support picking instanced meshes in chess-3d-gfx-helper
  public identifyPiece(type: PieceName, index: number): RenderablePiece | undefined {
    const candidates = [this.player, ...this.pawns, ...this.enemies]
    for (const piece of candidates) {
      if ( piece.type === type && 'index' in piece && piece.index === index) {
        return piece
      }
    }
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
    // console.log(`collect reward ${name}`)

    chessRun.collected.push(name) // add to history
    const { collectAction } = COLLECTIBLES[name]
    if (collectAction) {
      collectAction(this) // do item-specific action (chess-rewards.ts)
    }

    isResetQueued = true
    this.context.startTransition({
      transition: Transition.create('checkered', this.context),
      callback: () => {
        emptyScene.background = flatChessBackground
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

    resetMeshes(this, this.player, [...this.pawns], [...this.enemies])
    this.hlTiles.updateAllowedMoves(this)
    showCurrentPiece(this.player.type)
  }

  public movePlayerToTile(clickedTile: TileIndex) {
    // start move phase
    const oldTile = this.player.tile
    const startPos = this.getPosOnTile(oldTile).clone()
    const endPos = this.getPosOnTile(clickedTile).clone()
    this.currentMove = new ChessMoveAnim(startPos, endPos, clickedTile)
    this.currentPhase = 'player-anim'

    playSound('chessPlonk')

    // // highlight new tile already
    // this.player.tile = clickedTile
    // this.hlTiles.updateAllowedMoves(this)
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
    const height = this.context.terrain.generatedTiles[tile.i]?.liveHeight

    const writeTo = target || positionDummy
    writeTo.set(x, (height || 13), z)

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
