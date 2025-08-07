/**
 * @file chess-level-parser.ts
 *
 * Reads json data and sets up terrain tiles
 * to use as chess board.
 */

import * as chessLevels from './chess-levels.json'

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileGroup, TileOverrides } from 'core/groups/tile-group'
import { pickColorsForChessTile } from '../chess-colors'
import type { ChessLevel, CollectibleName, PieceName as ShortName } from './chess-levels.json.d'
import type { PieceName } from '../chess-enums.ts'
import type { PieceColor } from './chess-levels.json.d'
import type { Piece } from './chess-levels.json.d'
import { chessRun, type Chess } from '../chess-helper'

// make terrain tile part of chess board
function getChessTileOverrides(tile: TileIndex): TileOverrides {
  const { x, z } = tile
  const checkeredIndex = Math.abs((x + z) % 2)
  return {
    isWater: false,
    isFlora: false,
    height: 135 + checkeredIndex,
    isVisible: true,
  }
}

type LevelStartState = {
  playerPiece: ParsedPiece
  enemyPieces: Array<ParsedPiece>
  goalTile: TileIndex
}

function pickValidLevel(): number {
  const result = 0
  const { levels } = chessLevels

  const candidates: Array<number> = []
  for (let i = 0; i < levels.length; i++) {
    if (chessRun.completedLevels.includes(i)) {
      continue // level already completed
    }
    if (isLevelValid(levels[i] as ChessLevel, chessRun.collected)) {
      candidates.push(i)
    }
  }

  if (candidates.length === 0) {
    console.log('no valid chess levels')
    return 0
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

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

  const { playerPiece, enemyPieces, goalTile } = instance

  if (!playerPiece) {
    throw new Error('level has no player ("B_")')
  }

  if (!goalTile) {
    throw new Error('level has no "GG" target cell')
  }

  return { playerPiece, enemyPieces, goalTile }
}

class ChessLevelParser {
  public playerPiece?: ParsedPiece
  public enemyPieces: Array<ParsedPiece> = []
  public goalTile?: TileIndex

  constructor(
    private readonly levelIndex: number,
    private readonly terrain: TileGroup,
  ) {}

  loadLevel(center: TileIndex) {
    console.log('load chess level')

    const { terrain } = this
    terrain.generateAllTiles()
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
          else if (tileValue === 'WA') {
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
            terrain.overrideTile(tileIdx, getChessTileOverrides(tileIdx))
            terrain.members[tileIdx.i].isWater = false
            const colors = pickColorsForChessTile(tileIdx)
            terrain.gfxHelper.setColorsForTile(colors, tileIdx)
          }
        }
      }
    }
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
