/**
 * @file gamepad-btn-prompts.ts
 *
 * Extra overlay graphics that appear when using a gamepad.
 */

import type { SeaBlock } from 'sea-block'
import { getImage } from './image-asset-loader'
import type { ImageAssetUrl } from './image-asset-urls'
import type { Vector2, Vector3 } from 'three'
import { locateOnScreen } from 'util/locate-on-screen'

// position on screen or in world
let selectPrompt: null | Vector2 | Vector3 = null

export function setGamepadConfirmPrompt(pos: null | Vector2 | Vector3) {
  selectPrompt = pos
}

function getConfirmBtnUrl(seaBlock: SeaBlock): ImageAssetUrl {
  if (seaBlock.hasConnectedGamepad === 'xbox') {
    return 'gamepad/xbox-a-btn.png'
  }
  return 'gamepad/playstation-x-btn.png'
}

export function drawGamepadPrompts(seaBlock: SeaBlock) {
  if (seaBlock.transition) {
    return // don't interfere with transition
  }

  const src = getConfirmBtnUrl(seaBlock)
  const img = getImage(src)

  const { w, h } = seaBlock.layeredViewport
  const ctx = seaBlock.layeredViewport.frontCtx

  ctx.clearRect(0, 0, w, h)

  if (!seaBlock.isUsingGamepad) {
    return // just keep layer clear
  }

  if (selectPrompt) {
    if ('z' in selectPrompt) {
      const screenPos = locateOnScreen(seaBlock, selectPrompt)
      screenPos.round()
      ctx.drawImage(img,
        0, 0, img.width, img.height,
        screenPos.x, screenPos.y, img.width, img.height,
      )
    }
    else {
      ctx.drawImage(img,
        0, 0, img.width, img.height,
        selectPrompt.x, selectPrompt.y, img.width, img.height,
      )
    }
  }
}
