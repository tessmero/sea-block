/**
 * @file chess-run.ts
 *
 * Singleton representing the current roguelike run.
 * Helpers to save in localstorage and resume on startup.
 */

import type { CollectibleName } from './levels/chess-levels.json.d'

type ChessRun = {
  hasSwitchedPiece: boolean // show hint until first time switching pieces
  hasPlacedPawn: boolean // show hint until first time placing pawn
  hasLeftBoard: boolean // unlock open-world mechs after first move outside
  collectedPawns: number // remaining deployable pawn minions
  collected: Array<CollectibleName> // history of collected rewards
  completedLevels: Array<number> // indices in level data
}

export const START_COLLECTED = [
  'rook', // ...PIECE_NAMES,
  // 'dual-vector-foil'
] as const satisfies Array<CollectibleName>

export const START_PAWNS = 1

export const chessRun: ChessRun = {
  hasSwitchedPiece: false,
  hasPlacedPawn: false,
  hasLeftBoard: false,
  collectedPawns: START_PAWNS,
  collected: [...START_COLLECTED],
  completedLevels: [],
}
