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
import type { PieceName as ShortName } from './chess-levels.json.d'
import type { PieceName } from '../chess-enums.ts'
import type { PieceColor } from './chess-levels.json.d'
import type { Piece } from './chess-levels.json.d'

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
  playerTile: TileIndex
  goalTile: TileIndex
}

export function loadChessLevel(levelIndex: number, terrain: TileGroup, center: TileIndex): LevelStartState {
  const instance = new ChessLevelParser(levelIndex, terrain)
  instance.loadLevel(center)

  const { playerPiece, playerTile, goalTile } = instance

  if (!playerPiece || !playerTile) {
    throw new Error('level has no chess piece')
  }

  if (!goalTile) {
    throw new Error('level has no "GG" target cell')
  }

  return { playerPiece, playerTile, goalTile }
}

class ChessLevelParser {
  public playerPiece?: ParsedPiece
  public playerTile?: TileIndex
  public goalTile?: TileIndex

  constructor(
    private readonly levelIndex: number,
    private readonly terrain: TileGroup,
  ) {}

  loadLevel(center: TileIndex) {
    const { terrain } = this
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
        if (tileIdx) {
          const tileValue = layout[dz][dx]
          if (tileValue === '  ') {
            // empty tile
          }
          else if (tileValue === 'GG') {
            this.goalTile = tileIdx // goal
          }
          else {
            this.playerPiece = parsePiece(tileValue as Piece)
            this.playerTile = tileIdx // player
          }

          terrain.overrideTile(tileIdx, getChessTileOverrides(tileIdx))
          terrain.members[tileIdx.i].isWater = false

          const colors = pickColorsForChessTile(tileIdx)
          terrain.gfxHelper.setColorsForTile(colors, tileIdx)
        }
      }
    }
  }
}

// parse piece from json dataa e.g. 'BH' -> black knight
function parsePiece(piece: Piece): ParsedPiece {
  const suffix = piece.at(1) as ShortName
  if (!(suffix in expansions)) {
    throw new Error(`invalid piece in chess level json: '${piece}'`)
  }
  return {
    color: piece.at(1) as PieceColor,
    type: expansions[suffix as ShortName],
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
}
