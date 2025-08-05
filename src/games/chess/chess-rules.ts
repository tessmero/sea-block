/**
 * @file chess-rules.ts
 *
 * Describes allowed moves for each chess piece.
 * Also provides a helper to apply rules in the context
 * of sea-block terrain tiles being used as a chessboard.
 */

import type { PieceName } from './chess-enums'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileGroup } from 'core/groups/tile-group'

// decsription of possible moves for a piece
type Moveset = {
  range: 'short' | 'long'
  deltas: Array<Delta>
}
type Delta = [number, number]

// diagonal tile deltas
const DIAG = [
  [-1, -1], [1, -1], [1, 1], [-1, 1],
] as const satisfies Array<Delta>

// adjacent tile deltas
const ADJ = [
  [0, -1], [0, 1], [-1, 0], [1, 0],
] as const satisfies Array<Delta>

// list of standard chess moves
export const CHESS_MOVES = {
  knight: {
    range: 'short',
    deltas: [

      // knight (horse) L-shaped moves
      [1, 2], [-1, 2], [-1, -2], [1, -2],
      [2, 1], [-2, 1], [-2, -1], [2, -1],

    ],
  },
  rook: {

    // slide any distance along grid axis
    range: 'long',
    deltas: [
      ...ADJ,
    ],
  },
  bishop: {

    // slide any distance along diagonals
    range: 'long',
    deltas: [
      ...DIAG,
    ],
  },
  king: {
    range: 'short',
    deltas: [
      ...ADJ,
      ...DIAG,
    ],
  },
  queen: {
    range: 'long',
    deltas: [
      ...ADJ,
      ...DIAG,
    ],
  },

  pawn: {
    range: 'short',
    deltas: [

      // attacks for both black and white
      ...DIAG,

      // regular forward move for both black and white
      [0, 1],
      [0, -1],

      // double forward move for both black and white
      [0, 2],
      [0, -2],
    ],
  },
} as const satisfies Record<PieceName, Moveset>

// start extended rules applied to sea-block tiles

// Get Allowed Moves Parameters
type GamPars = {
  piece: PieceName
  tile: TileIndex
  terrain: TileGroup
}

export function getAllowedMoves(params: GamPars): Array<TileIndex> {
  const { piece, tile, terrain } = params
  const { range, deltas } = CHESS_MOVES[piece]

  // console.log(`getallowedmoves ${tile.x},${tile.z}`)

  const result: Array<TileIndex> = []

  const maxSteps = (range === 'long') ? 8 : 1

  for (const [dx, dz] of deltas) {
    for (let i = 1; i <= maxSteps; i++) {
      const otherX = tile.x + dx * i
      const otherZ = tile.z + dz * i
      const otherTile = terrain.grid.xzToIndex(otherX, otherZ)
      if (!otherTile) {
        continue // out of bounds
      }

      if (canLandOn(otherTile, params)) {
        result.push(otherTile)
      }
      else {
        break
      }

      if (!canMoveThrough(otherTile, params)) {
        break
      }
    }
  }

  return result
}

function canLandOn(targetTile: TileIndex, params: GamPars): boolean {
  const { isWater } = params.terrain.members[targetTile.i]
  return !isWater
}

function canMoveThrough(targetTile: TileIndex, params: GamPars): boolean {
  const { isWater } = params.terrain.members[targetTile.i]
  return !isWater
}
