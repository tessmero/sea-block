/**
 * @file chess-level-parser.ts
 *
 * Reads json data and sets up terrain tiles
 * to use as chess board.
 */

import * as chessLevels from './chess-levels.json'

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileGroup } from 'core/groups/tile-group'
import type { ChessLevel, CollectibleName, ShortPieceName as ShortName } from './chess-levels.json.d'
import type { PieceName } from '../chess-enums.ts'
import type { PieceColor } from './chess-levels.json.d'
import type { Piece } from './chess-levels.json.d'
import { chessRun } from '../chess-run'
import type { Chess } from '../chess-helper'

type LevelStartState = {
  playerPiece: ParsedPiece
  enemyPieces: Array<ParsedPiece>
  boardTiles: Array<number>
  goalTile: TileIndex
}

function pickValidLevel(): number {
  const { levels } = chessLevels

  const candidates: Array<number> = []
  for (let i = 0; i < levels.length; i++) {
    if (chessRun.completedLevels.includes(i)) {
      continue // level already completed
    }
    if (isLevelValid(levels[i] as ChessLevel, chessRun.collected)) {
      candidates.push(i)
      break // use first valid level
    }
  }

  if (candidates.length === 0) {
    // console.log('no valid chess levels')
    return 0
  }

  const selectedLevel = candidates[Math.floor(Math.random() * candidates.length)]

  currentLevelIndex = selectedLevel
  currentLevelId = chessLevels.levels[selectedLevel].id

  return selectedLevel
}

export let currentLevelIndex = 0
export let currentLevelId = chessLevels.levels[0].id

function isLevelValid(level: ChessLevel, context: Array<CollectibleName>) {
  const { requires } = level
  if (!requires) {
    return true // level is valid (no requirements)
  }
  const collected: Array<CollectibleName> = [...context]
  for (const req of requires) {
    const i = collected.indexOf(req)
    if (i === -1) {
      return false // level is invalid (missing requirement)
    }
    collected.splice(i, 1) // remove element at index i
  }
  return true // level is valid (collected all requirements)
}

export function markLevelCompleted() {
  chessRun.completedLevels.push(levelIndex)
}

let levelIndex = 0
export function loadChessLevel(chess: Chess): LevelStartState {
  levelIndex = pickValidLevel()

  const { terrain } = chess.context
  const center = chess.centerTile
  const instance = new ChessLevelParser(levelIndex, terrain)
  instance.loadLevel(center)

  const { playerPiece, enemyPieces, boardTiles, goalTile } = instance

  if (!boardTiles || boardTiles.length === 0) {
    throw new Error('level has no chessboard tiles')
  }

  if (!playerPiece) {
    throw new Error('level has no player ("B_")')
  }

  if (!goalTile) {
    throw new Error('level has no "GG" target cell')
  }

  return { playerPiece, enemyPieces, boardTiles, goalTile }
}

class ChessLevelParser {
  public playerPiece?: ParsedPiece // B_ single black piece in level data
  public enemyPieces: Array<ParsedPiece> = [] // W_ white pieces in level data

  public boardTiles?: Array<number> = [] // all playable non-WA tiles
  public goalTile?: TileIndex // GG tile with treasure chest

  constructor(
    private readonly levelIndex: number,
    private readonly terrain: TileGroup,
  ) {}

  loadLevel(center: TileIndex) {
    // console.log('load chess level')

    const { terrain } = this
    // terrain.regenerateAllTiles()
    // console.log('load level rengereated all tiles, member is water = ', terrain.members[0].isWater)

    // Get the first level's layout (assume 8x8)
    const layout = chessLevels.levels[this.levelIndex % chessLevels.levels.length].layout
    const nRows = layout.length // 8
    const nCols = layout[0].length
    const halfZ = Math.floor(nRows / 2)
    const halfX = Math.floor(nCols / 2)

    for (let dz = 0; dz < nCols; dz++) {
      for (let dx = 0; dx < nRows; dx++) {
        // Calculate tile position relative to center
        const x = center.x + dx - halfX
        const z = center.z + dz - halfZ
        const tileIdx = terrain.grid.xzToIndex(x, z)
        let isWater = false
        if (tileIdx) {
          const tileValue = layout[dz][dx]
          if (tileValue === '  ') {
            // empty tile
          }
          else if (tileValue === 'GG') {
            this.goalTile = tileIdx // goal
          }
          else if (tileValue === '~~') {
            isWater = true// water
          }
          else if (tileValue.startsWith('B')) {
            this.playerPiece = parsePiece(tileValue as Piece, tileIdx) // player
          }
          else if (tileValue.startsWith('W')) {
            this.enemyPieces.push(parsePiece(tileValue as Piece, tileIdx)) // enemy
          }

          if (!isWater) {
            // solid chessboard tile
            this.boardTiles?.push(tileIdx.i)
            // terrain.overrideTile(tileIdx, getChessTileOverrides(tileIdx))
            // terrain.members[tileIdx.i].isWater = false
            // const colors = pickColorsForChessTile(tileIdx)
            // terrain.gfxHelper.setColorsForTile(colors, tileIdx)
          }
        }
      }
    }
    // console.log('finish load level board tiles', this.boardTiles?.length)
  }
}

// parse piece from json dataa e.g. 'BH' -> black knight
function parsePiece(piece: Piece, tile: TileIndex): ParsedPiece {
  const suffix = piece.at(1) as ShortName
  if (!(suffix in expansions)) {
    throw new Error(`invalid piece in chess level json: '${piece}'`)
  }
  return {
    color: piece.at(1) as PieceColor,
    type: expansions[suffix as ShortName],
    tile,
  }
}
const expansions = {
  B: 'bishop',
  H: 'knight',
  R: 'rook',
  K: 'king',
  Q: 'queen',
  P: 'pawn',
} as const satisfies Record<ShortName, PieceName>
export type ParsedPiece = {
  type: PieceName
  color: PieceColor
  tile: TileIndex
}
