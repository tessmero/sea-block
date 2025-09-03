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
import type { GuiElement } from 'guis/gui'

export const PROMPT_NAMES = ['A', 'B', 'LB', 'RB', 'start', 'back'] as const
export type PromptName = (typeof PROMPT_NAMES)[number]

type PromptSpec = {
  getAssetUrl: (params: { isPlaystation: boolean }) => ImageAssetUrl
}
export const allPrompts: Record<PromptName, PromptSpec> = {
  A: {
    getAssetUrl: ({ isPlaystation }) => {
      if (isPlaystation) return 'gamepad/playstation-X.png'
      return 'gamepad/xbox-A.png'
    },
  },
  B: {
    getAssetUrl: ({ isPlaystation }) => {
      if (isPlaystation) return 'gamepad/playstation-O.png'
      return 'gamepad/xbox-B.png'
    },
  },
  LB: {
    getAssetUrl: () => {
      return 'gamepad/playstation-L1.png'
    },
  },
  RB: {

    getAssetUrl: () => {
      return 'gamepad/playstation-R1.png'
    },
  },
  start: {

    getAssetUrl: () => {
      return 'gamepad/xbox-start.png'
    },
  },
  back: {

    getAssetUrl: () => {
      return 'gamepad/xbox-back.png'
    },
  },
}

// position on screen or in world
let selectPrompt: null | Vector2Like | Vector3Like = null

export function setGamepadConfirmPrompt(pos: null | Vector2Like | Vector3Like) {
  selectPrompt = pos
}

function getPromptUrl(seaBlock: SeaBlock, promptName: PromptName): ImageAssetUrl {
  // let isXbox = false
  let isPlaystation = false
  if (seaBlock.hasConnectedGamepad === 'xbox') {
    // isXbox = true
  }
  else {
    isPlaystation = true
  }
  return allPrompts[promptName].getAssetUrl({ isPlaystation })
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
    const elem = visiblePrompts[prompt] as GuiElement
    const { rectangle, display } = elem
    if (display.isVisible === false) {
      continue
    }
    if (rectangle) {
      const src = getPromptUrl(seaBlock, prompt as PromptName)
      const img = getImage(src)
      const { offset = [0, 0] } = display.gamepadPrompt ?? {}
      ctx.drawImage(img,
        0, 0, img.width, img.height,
        offset[0] + rectangle.x + rectangle.w / 2 - img.width / 2,
        offset[1] + rectangle.y + rectangle.h / 2 - img.height / 2,
        img.width, img.height,
      )
    }
  }

  // show prompts

  if (selectPrompt) {
    const src = getPromptUrl(seaBlock, 'A')
    const img = getImage(src)
    if ('z' in selectPrompt && !seaBlock.isShowingSettingsMenu) {
      // has set 3D world posigion
      const screenPos = locateOnScreen(seaBlock, selectPrompt)
      screenPos.round()
      ctx.drawImage(img,
        0, 0, img.width, img.height,
        screenPos.x, screenPos.y, img.width, img.height,
      )
    }
    else {
      // has set 2D screen position
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
