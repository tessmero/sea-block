/**
 * @file chess-rewards.ts
 *
 * Collectible pieces and passive powerups for chess roguelike.
 */

import type { ImageAssetUrl } from 'gfx/2d/image-asset-loader'
import { chessRun, type Chess } from './chess-helper'
import type { CollectibleName } from './levels/chess-levels.json.d'

// unlock playable piece, or add one spawnable pawn, or add passive powerup
export type Collectible = {
  description: string
  icon: ImageAssetUrl
  isValid: (chess: Chess) => boolean
  collectAction?: (chess: Chess) => void
}

export function randomCollectible(context: Chess): CollectibleName {
  const valid = getValidCollectibles(context)
  return valid[Math.floor(Math.random() * valid.length)]
}

function getValidCollectibles(context: Chess): Array<CollectibleName> {
  const result: Array<CollectibleName> = []
  for (const name in COLLECTIBLES) {
    if (COLLECTIBLES[name].isValid(context)) {
      result.push(name as CollectibleName)
    }
  }
  return result
}

export const COLLECTIBLES: Record<string, Collectible> = {

  'pawn': {
    description: 'Loyal follower',
    icon: 'icons/chess/16x16-pawn.png',
    isValid: () => true, // can be collected multiple times
    collectAction: () => { chessRun.collectedPawns++ },
  },

  'bishop': {
    description: 'Moves diagonally',
    icon: 'icons/chess/16x16-bishop.png',
    isValid: () => !chessRun.collected.includes('bishop'),
  },

  'knight': {
    description: 'Jumps in L-shape',
    icon: 'icons/chess/16x16-knight.png',
    isValid: () => !chessRun.collected.includes('knight'),
  },

  'rook': {
    description: 'Moves in straight lines',
    icon: 'icons/chess/16x16-rook.png',
    isValid: () => !chessRun.collected.includes('rook'),
  },

  'queen': {
    description: 'Moves in any direction',
    icon: 'icons/chess/16x16-queen.png',
    isValid: () => !chessRun.collected.includes('queen'),
  },

  'king': {
    description: 'Moves in any direction',
    icon: 'icons/chess/16x16-king.png',
    isValid: () => !chessRun.collected.includes('king'),
  },

  'dual-vector-foil': {
    description: 'reduce to 2D',
    icon: 'icons/16x16-arrow-down.png',
    isValid: () => !chessRun.collected.includes('dual-vector-foil'),
  },

}
