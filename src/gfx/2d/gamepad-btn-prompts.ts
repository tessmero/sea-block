/**
 * @file gamepad-btn-prompts.ts
 *
 * Extra overlay graphics that appear when using a gamepad.
 */

import type { SeaBlock } from 'sea-block'
import { getImage } from './image-asset-loader'
import type { ImageAssetUrl } from './image-asset-urls'
import type { Vector2Like, Vector3Like } from 'three'
import { locateOnScreen } from 'util/locate-on-screen'
import { visiblePrompts } from 'input/ggui-nav-wasd'

// position on screen or in world
let selectPrompt: null | Vector2Like | Vector3Like = null

export function setGamepadConfirmPrompt(pos: null | Vector2Like | Vector3Like) {
  selectPrompt = pos
}

function getPromptUrl(seaBlock: SeaBlock, prompt: 'cancel' | 'confirm'): ImageAssetUrl {
  if (seaBlock.hasConnectedGamepad === 'xbox') {
    if (prompt === 'confirm') {
      return 'gamepad/xbox-a-btn.png'
    }
    else {
      return 'gamepad/xbox-b-btn.png'
    }
  }
  if (prompt === 'confirm') {
    return 'gamepad/playstation-x-btn.png'
  }
  else {
    return 'gamepad/playstation-o-btn.png'
  }
}

export function drawGamepadPrompts(seaBlock: SeaBlock) {
  if (seaBlock.transition) {
    return // don't interfere with transition
  }

  const { w, h } = seaBlock.layeredViewport
  const ctx = seaBlock.layeredViewport.frontCtx

  ctx.clearRect(0, 0, w, h)

  if (!seaBlock.isUsingGamepad) {
    return // just keep layer clear
  }

  // check if for elements with gamepadPrompt property assigned
  for (const prompt in visiblePrompts) {
    const { rectangle } = visiblePrompts[prompt]
    if (rectangle) {
      const src = getPromptUrl(seaBlock, prompt as 'confirm' | 'cancel')
      const img = getImage(src)
      ctx.drawImage(img,
        0, 0, img.width, img.height,
        rectangle.x, rectangle.y, img.width, img.height,
      )
    }
  }

  // show prompts

  if (selectPrompt) {
    const src = getPromptUrl(seaBlock, 'confirm')
    const img = getImage(src)
    if ('z' in selectPrompt && !seaBlock.isShowingSettingsMenu) {
      // has set world posigion
      const screenPos = locateOnScreen(seaBlock, selectPrompt)
      screenPos.round()
      ctx.drawImage(img,
        0, 0, img.width, img.height,
        screenPos.x, screenPos.y, img.width, img.height,
      )
    }
    else {
      // has set screen position
      ctx.drawImage(img,
        0, 0, img.width, img.height,
        selectPrompt.x, selectPrompt.y, img.width, img.height,
      )
    }
  }
  else {
    // no screen or world position set

  }
}
