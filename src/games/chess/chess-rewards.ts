/**
 * @file chess-rewards.ts
 *
 * Collectible pieces and passive powerups for chess roguelike.
 */

import type { ImageAssetUrl } from 'gfx/2d/image-asset-loader'
import type { CollectibleName } from './levels/chess-levels.json.d'
import type { Chess } from './chess-helper'
import { chessRun } from './chess-run'
import { updatePawnButtonLabel } from './gfx/chess-2d-gfx-helper'

// unlock playable piece, or add one spawnable pawn, or add passive powerup
export type Collectible = {
  title: string
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

export const COLLECTIBLES: Record<CollectibleName, Collectible> = {

  'dual-vector-foil': {
    title: 'Downgrade',
    description: `
      Reduce to 2D
      prevents exploration
    `,
    icon: 'icons/16x16-arrow-down.png',
    isValid: () => !chessRun.collected.includes('dual-vector-foil')
      && chessRun.collected.includes('king'),
  },

  // 'long-stride': {
  //   title: 'increases max move to 8 tiles',
  //   icon: 'icons/16x16-arrow-right.png',
  //   isValid: () => chessRun.hasLeftBoard // only useful in open-world
  //     && !chessRun.collected.includes('long-stride'),
  // },

  'pawn': {
    title: '+1 Pawn',
    description: `

    `,
    icon: 'icons/chess/16x16-pawn.png',
    isValid: () => true, // can be collected multiple times
    collectAction: () => {
      chessRun.collectedPawns++
      updatePawnButtonLabel()
    },
  },

  'rook': {
    title: 'Unlock Rook',
    description: `
    
    `,
    icon: 'icons/chess/16x16-rook.png',
    isValid: () => !chessRun.collected.includes('rook'),
  },

  'bishop': {
    title: 'Unlock Bishop',
    description: `
    
    `,
    icon: 'icons/chess/16x16-bishop.png',
    isValid: () => !chessRun.collected.includes('bishop'),
  },

  'knight': {
    title: 'Unlock Knight',
    description: `
    
    `,
    icon: 'icons/chess/16x16-knight.png',
    isValid: () => !chessRun.collected.includes('knight')
      && chessRun.collected.includes('bishop'),
  },

  'queen': {
    title: 'Unlock Queen',
    description: `
    
    `,
    icon: 'icons/chess/16x16-queen.png',
    isValid: () => !chessRun.collected.includes('queen')
      && chessRun.collected.includes('knight'),
  },

  'king': {
    title: 'Unlock King',
    description: `
    
    `,
    icon: 'icons/chess/16x16-king.png',
    isValid: () => !chessRun.collected.includes('king')
      && chessRun.collected.includes('queen'),
  },

}
