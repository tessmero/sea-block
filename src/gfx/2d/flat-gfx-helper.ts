/**
 * @file flat-gfx-helper.ts
 *
 * Helper to display elements on the front layer and
 * only redraw elements that have changed state.
 */

import type { SeaBlock } from 'sea-block'
import type { ButtonState, FlatButton } from './flat-button'

// result of loading a FlatElement (game.ts)
export type LoadedImage = {
  image: FlatButton// OffscreenCanvas
  layoutKey: string // required
  clickAction?: (seaBlock: SeaBlock) => void
  unclickAction?: (seaBlock: SeaBlock) => void
  hotkeys?: ReadonlyArray<string>
}

export const loadedImages: Record<string, FlatButton> = {} // populated at startup

let lastDrawnState: Record<string, ButtonState> = {}

export function resetFrontLayer() {
  lastDrawnState = {}
}

export function updateFrontLayer(seaBlock: SeaBlock) {
  const { layeredViewport, game } = seaBlock
  const { ctx } = layeredViewport
  const { gui } = game
  const layout = gui.layoutRectangles

  for (const layoutKey in layout) {
    const rect = layout[layoutKey]

    const stateToDraw = gui.getElementState(layoutKey)
    if (stateToDraw !== lastDrawnState[layoutKey]) {
      const image = loadedImages[layoutKey]
      if (!image) {
        continue // not yet loaded
      }
      // console.log(layoutKey, JSON.stringify(rect))

      ctx.drawImage(image.images[stateToDraw], rect.x, rect.y)
      lastDrawnState[layoutKey] = stateToDraw
    }
  }
}
