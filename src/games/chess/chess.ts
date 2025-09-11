/**
 * @file chess.ts
 *
 * Chess/chess singleton main object for chess game.
 */

import { Vector3 } from 'three'
import type { GameElement } from '../game'
import { type GameUpdateContext } from '../game'
import { emptyScene, type SeaBlock } from 'sea-block'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { setTilePickY, type ProcessedSubEvent } from 'input/mouse-touch-input'
import type { RenderablePiece, UniquePiece } from './gfx/chess-3d-gfx-helper'
import { resetMeshes, updateMeshes } from './gfx/chess-3d-gfx-helper'
import { ChessHlTiles } from './chess-hl-tiles'
import { ChessMoveAnim } from './chess-move-anim'
import { PIECE_NAMES, type ChessPhase, type PieceName } from './chess-enums'
import { currentLevelId, loadChessLevel } from './levels/chess-level-parser'
import { playSound } from 'audio/sound-effect-player'
import {
  buildGoalDiagram, flatChessBackground,
  updateFlatView, updatePawnButtonLabel,
} from './gfx/chess-2d-gfx-helper'
import { COLLECTIBLES, randomCollectible } from './chess-rewards'
import type { CollectibleName } from './levels/chess-levels.json.d'
import type { TilePosition } from 'core/grid-logic/tiled-grid'
import { buildPawnMoves, buildEnemyMoves, nextPhasePickers } from './chess-sequences'
import { randomTransition, Transition } from 'gfx/transitions/transition'
import { chessRun, START_COLLECTED, START_PAWNS } from './chess-run'
import { cancelPawnBtn, flatViewport, goalDisplays, pawnBtn, showCurrentPiece } from './gui/chess-hud-elements'
import { toggleGameOverMenu } from './gui/chess-hud-dialog-elements'
import { showPhaseLabel } from './gui/chess-debug-elements'
import { updateChessPhase } from './chess-update-helper'
import { FREECAM_PLAYLIST, playNextTrack } from 'audio/song-player'
import {
  flatViewPortClick, flatViewPortUnclick,
  resetHeldChessInputs, updateHeldChessInputs,
} from './chess-input-helper'
import { ChessWaveMaker } from './chess-wave-maker'
import { ZoomTransition } from 'gfx/transitions/imp/zoom-transition'
import { acceptBtn } from './gui/chess-rewards-elements'
import { updateRepaintEffect } from './gfx/chess-repaint-effect'
import { rewardHelpDiagram, rewardHelpState } from './gui/chess-reward-help-elements'
import { ChessScenery } from './levels/chess-scenery'
import { gguiHandler, hideGguiCursor } from 'gfx/3d/ggui-3d-cursor'
import { orbitWithRightJoystick } from 'guis/elements/joysticks'
import { zoomWithTriggers } from 'games/imp/free-cam-game'
import { putGguiCursorOnSomeValidMove } from './chess-ggui-nav'
import { chessBoardPipeline } from 'gfx/3d/pipelines/chess-board-pipeline'

// no 3D terrrain in background when selecting reward
export function chessAllow3DRender(): boolean {
  if (chess.currentPhase === 'reward-choice') {
    return false
  }
  if (chessRun.collected.includes('dual-vector-foil')) {
    return false
  }
  return true
}

export function chessAllowGgui3DCursor(): boolean {
  if (chess.currentPhase === 'player-choice' || chess.currentPhase === 'place-pawn') {
    return true
  }
  return false
}

export function chessAllowGgui(): boolean {
  if (chess.currentPhase === 'reward-choice') {
    return true
  }
  return false
}

export function clearChessRun(): void {
  isResetQueued = true
  chessRun.collectedPawns = START_PAWNS
  chessRun.collected = [...START_COLLECTED]
  chessRun.completedLevels = []
}

let isResetQueued = true
export let chess: Chess
export function resetChess(seaBlock: SeaBlock) {
  // console.log('reset chess')

  if (isResetQueued) {
    isResetQueued = false
    chess = new Chess(seaBlock)
    chessBoardPipeline.setChess(chess)
  }
  resetHeldChessInputs()
  // if (context.isUsingGamepad && !context.isShowingSettingsMenu) {
  //   putGguiCursorOnSomeValidMove(instance)
  // }
  // else {
  hideGguiCursor()
  // }
  seaBlock.toggleSettings(false)
}

export function quitChess(): void {
  const seaBlock = chess.context

  // start transition back to free-cam with original scenery
  const item = seaBlock.config.tree.children.game
  item.value = 'free-cam'
  seaBlock.startTransition({
    callback: () => {
      // reset ui
      seaBlock.toggleSettings(false)
      toggleGameOverMenu(seaBlock, false)

      // erase chess state and restore pre-chess scene
      clearChessRun()
      ChessScenery.restoreOriginalSnapshot(seaBlock)
      playNextTrack(FREECAM_PLAYLIST)
      seaBlock.onCtrlChange(item)
    },
  })
}

export function getChessPhase() {
  const result = chess?.currentPhase || 'player-choice'
  // console.log('get ches sphase', result, instance)
  return result
}

// used to implement chess-game
export function updateChess(context: GameUpdateContext): void {
  // if (context.seaBlock.transition) {
  //   return // do not update chess during transition
  // }

  if (context.seaBlock.isUsingGamepad
    && chess.currentPhase !== 'reward-choice'
    && !context.seaBlock.isShowingSettingsMenu
    && (!chess.hlTiles.hovered || !gguiHandler)) {
    // make sure gamepad cursor is visible in world or flat view
    putGguiCursorOnSomeValidMove(chess)
  }

  updateHeldChessInputs()
  if (rewardHelpState) {
    updateRepaintEffect(context.dt)
    rewardHelpDiagram.display.needsUpdate = true
  }
  chess.update(context)
}

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
    const { terrain } = context

    this.hlTiles = new ChessHlTiles()

    // find center tile based on camera target
    const { x, z } = terrain.centerXZ
    // const { target } = orbitControls
    // const { x, z } = target
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
    // console.log('set board tiles', boardTiles.length)
    this.boardTiles = boardTiles
    this.goalTile = goalTile
    Chess.queueHltUpdate()

    // reset instance counts and setup current piece mesh
    resetMeshes(this, playerPiece, [], enemyPieces)

    // place player and goal based on parsed level
    // treasureChestMesh.position.copy(this.getPosOnTile(goalTile))
    // this.updateAllowedMoves()
    // Chess.isHltUpdateQueued = true

    // build help diagrams
    buildGoalDiagram(playerPiece.type)
    this.updateFlatView()
    flatViewport.clickAction = ({ inputEvent }) => {
      flatViewPortClick(inputEvent as ProcessedSubEvent)
    }
    flatViewport.unclickAction = ({ inputEvent }) => {
      flatViewPortUnclick(inputEvent as ProcessedSubEvent)
    }

    // sphere to interact with water and make waves
    this.waveMaker = new ChessWaveMaker(context.sphereGroup.members[1], context)
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
    this.updateAllowedMoves()
    pawnBtn.display.isVisible = false
    cancelPawnBtn.display.isVisible = true
    pawnBtn.display.needsUpdate = true
    cancelPawnBtn.display.needsUpdate = true
    this.context.layeredViewport.handleResize(this.context)
  }

  public updateAllowedMoves() {
    this.hlTiles.updateAllowedMoves(this)
  }

  public cancelPlacePawn() {
    buildGoalDiagram(this.player.type)
    this.currentPhase = 'player-choice'
    this.updateAllowedMoves()
    pawnBtn.display.isVisible = true
    cancelPawnBtn.display.isVisible = false
    pawnBtn.display.needsUpdate = true
    cancelPawnBtn.display.needsUpdate = true
    this.context.layeredViewport.handleResize(this.context)
  }

  public gotoNextPhase(): ChessPhase {
    const result = nextPhasePickers[this.currentPhase](this)

    if (result === 'pawn-anim') {
      this.pawnMoves = buildPawnMoves()
    }
    if (result === 'enemy-anim') {
      this.enemyMoves = buildEnemyMoves()
    }

    this.currentPhase = result
    return result
  }

  public static getHltUpdateQueued() {
    return this.isHltUpdateQueued
  }

  public static queueHltUpdate() {
    if (this.isHltUpdateQueued) {
      return
    }
    // console.log('queue new hlt update')
    if (chess?.hlTiles) chess.hlTiles.allowedMoves.clear()
    this.isHltUpdateQueued = true
  }

  private static isHltUpdateQueued = false
  public update(context: GameUpdateContext) {
    const { seaBlock, dt } = context
    const { terrain } = seaBlock

    if (Chess.isHltUpdateQueued) {
      Chess.isHltUpdateQueued = false
      this.updateAllowedMoves()
    }

    // update gui animation
    const frameIndex = Math.floor(performance.now() / 500) % 2

    for (const [i, display] of goalDisplays.entries()) {
      display.isVisible = (i === frameIndex)
      display.needsUpdate = true
    }

    if (!seaBlock.sphereGroup.members.includes(this.waveMaker.sphere)) {
      // throw new Error('wave maker sphere not in sphere group')
      // reconnect with active sphere
      this.waveMaker = new ChessWaveMaker(seaBlock.sphereGroup.members[1], seaBlock)
    }

    // update world
    this.waveMaker.updateWaveMaker(context)
    this.centerCameraOnChessBoard(dt)

    // use goal tile as representative (should always be part of chess board)
    const centerHeight = terrain.gfxHelper.getLiveHeight(this.goalTile)
    if (typeof centerHeight === 'number') setTilePickY(centerHeight)

    // update color-coding of valid move tiles
    // hlTiles.update()

    // show text for debugging
    showPhaseLabel(this.currentPhase)

    // place meshes on logical tiles
    updateMeshes()

    // advance phase-specific animation (may override mesh positions)
    updateChessPhase(context)

    orbitWithRightJoystick(context)
    zoomWithTriggers(context)

    this.updateFlatView()
  }

  // used to identify picked mesh instance
  public identifyPiece(type: PieceName, index: number): RenderablePiece | undefined {
    const candidates = [this.player, ...this.pawns, ...this.enemies]
    for (const piece of candidates) {
      if (piece.type === type && 'index' in piece && piece.index === index) {
        return piece
      }
    }
  }

  private updateFlatView() {
    // if( this.context.config.flatConfig.chessViewMode === '2D' ){
    if (chessRun.collected.includes('dual-vector-foil')
      && !this.context.isShowingSettingsMenu) {
      updateFlatView(this)
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
      collectAction() // do item-specific action (chess-rewards.ts)
    }

    isResetQueued = true

    let transition
    const rnd = Math.random()
    if (rnd < 0.5) {
      ZoomTransition.target = acceptBtn
      transition = Transition.create('zoom', this.context) as ZoomTransition
    }
    else {
      transition = randomTransition(this.context)
    }

    this.context.startTransition({
      transition,
      callback: () => {
        emptyScene.background = flatChessBackground
        this.context.onGameChange()
        ChessScenery.applyLevelScenery(this.context, currentLevelId)
        this.context.game.resetCamera(this.context)
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

    resetMeshes(this)
    this.updateAllowedMoves()
    showCurrentPiece(this.player.type)
  }

  public movePlayerToTile(clickedTile: TileIndex) {
    // start move phase
    const oldTile = this.player.tile
    const startPos = this.getPosOnTile(oldTile).clone()
    const endPos = this.getPosOnTile(clickedTile).clone()
    this.currentMove = new ChessMoveAnim(startPos, endPos, clickedTile)
    this.currentPhase = 'player-anim'

    playSound('chessJump')

    // // highlight new tile already
    // this.player.tile = clickedTile
    // this.updateAllowedMoves()
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
    writeTo.set(x, (height ?? 13), z)

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
