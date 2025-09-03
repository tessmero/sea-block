/**
 * @file chess-reward-help-elements.ts
 *
 * Elements for the reward help panel in chess reward selection.
 */

import type { GuiElement } from 'guis/gui'
import type { ChessLayoutKey } from 'guis/keys/chess-layout-keys'
import { COLLECTIBLES } from '../chess-rewards'
import type { Chess } from '../chess-helper'
import type { CollectibleName } from '../levels/chess-levels.json.d'
import type { ChessButton } from './chess-button'
import { addToSpriteAtlas } from 'gfx/2d/sprite-atlas'
import { getImage } from 'gfx/2d/image-asset-loader'
import { drawText } from 'gfx/2d/text/text-gfx-helper'
import { PIECE_NAMES } from '../chess-enums'
import type { PieceName } from '../chess-enums'
import { drawMovesDiagram } from '../gfx/chess-help-diagrams'
import { startRepaintEffect } from '../gfx/chess-repaint-effect'

type ChessElem = GuiElement<ChessLayoutKey>

// Panel overlays rewards selection except acceptBtn
export const rewardHelpPanel: ChessElem = {
  layoutKey: 'rewardHelpPanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}

export const rewardHelpCloseBtn: ChessButton = {
  layoutKey: 'rewardHelpCloseBtn',
  display: {
    type: 'button',
    icon: 'icons/16x16-x.png',
    isVisible: false,
  },
  chessAction: ({ chess }) => toggleRewardHelp(chess),
}

// Single diagram element for reward help
export const rewardHelpDiagram: ChessElem = {
  layoutKey: 'rewardHelpDiagram',
  display: {
    type: 'diagram',
    label: 'help-diagram',
    isVisible: false,
  },
}

// called on startup
const chessRewardHelpImages: Array<HTMLCanvasElement> = []
export async function preloadChessRewardHelpDiagrams() {
  for (const key of Object.keys(COLLECTIBLES)) {
    const { icon, title, description } = COLLECTIBLES[key as CollectibleName]
    // Create canvas for diagram
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw icon in top right
    ctx.drawImage(getImage(icon), 4, 4)

    // Draw title in top center
    drawText(ctx, {
      label: title,
      width: canvas.width,
      height: 16,
      font: 'default',
      textAlign: 'center',
      offset: [0, 0],
    })

    // If collectible is a chess piece, draw moves diagram in center
    if (PIECE_NAMES.includes(key as PieceName)) {
      drawMovesDiagram(ctx, {
        piece: key as PieceName,
        rectangle: {
          x: 0, y: 0,
          w: canvas.width,
          h: canvas.height,
        },
      })
    }
    else {
      // Draw description in center for non-piece collectibles
      drawText(ctx, {
        label: description,
        width: canvas.width,
        height: canvas.height,
        font: 'mini',
        textAlign: 'left',
        offset: [0, 0],
      })
    }

    // Add to sprite atlas
    addToSpriteAtlas(canvas)
    chessRewardHelpImages.push(canvas)
  }
}

export const CHESS_REWARD_HELP_ELEMENTS = [
  rewardHelpPanel,
  rewardHelpDiagram,
  rewardHelpCloseBtn,
] satisfies Array<GuiElement<ChessLayoutKey>>

type RewardHelpState = 'left' | 'right' | undefined
export let rewardHelpState: RewardHelpState = undefined

export function toggleRewardHelp(chess: Chess, state?: RewardHelpState) {
  rewardHelpState = state

  const isRewardHelpVisible = (typeof state === 'string')
  for (const { display } of ([rewardHelpPanel, rewardHelpCloseBtn])) {
    display.isVisible = isRewardHelpVisible
    display.needsUpdate = true
  }

  // Show/hide the single diagram
  rewardHelpDiagram.display.isVisible = (typeof state === 'string')
  rewardHelpDiagram.display.needsUpdate = true

  const clt = pickCollectible(chess, state)
  updateRewardHelpDiagram(clt)

  //
  chess.context.layeredViewport.handleResize(chess.context)
}

function pickCollectible(chess: Chess, state: RewardHelpState): CollectibleName | undefined {
  if (!state) {
    return undefined
  }
  const { leftReward, rightReward } = chess
  return state === 'left' ? leftReward : rightReward
}

export function updateRewardHelpDiagram(collectibleKey: CollectibleName | undefined) {
  const buffer = rewardHelpDiagram.display.imageset?.default
  if (!buffer) {
    throw new Error('rewardHelpDiagram element has no buffer')
  }
  const { width, height } = buffer
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D
  ctx.clearRect(0, 0, width, height)

  if (!collectibleKey) return
  const i = Object.keys(COLLECTIBLES).indexOf(collectibleKey)
  if (i === -1) return
  ctx.drawImage(chessRewardHelpImages[i], 0, 0)
  startRepaintEffect(buffer)
}
