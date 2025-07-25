/**
 * @file flat-gui-gfx-helper.ts
 *
 * Helper to display elements on the front layer and
 * only redraw elements that have changed state.
 */

import type { SeaBlock } from 'sea-block'
import { playSound } from 'audio/sound-effects'
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
  if (!seaBlock.didLoadAssets) {
    // do nothing
    return
  }

  const { layeredViewport } = seaBlock
  const { ctx } = layeredViewport

  for (const gui of seaBlock.getLayeredGuis()) {
    const layout = gui.layoutRectangles

    for (const layoutKey in layout) {
      const rect = layout[layoutKey]

      const stateToDraw = gui.getElementState(layoutKey)
      const lastState = lastDrawnState[layoutKey]
      if (stateToDraw !== lastState) {
        const image = loadedImages[layoutKey]
        if (!image) {
          continue // not yet loaded
        }
        // console.log(layoutKey, JSON.stringify(rect))

        if (lastState && stateToDraw === 'pressed') {
          playSound('click')
        }
        else if (lastState === 'pressed' && stateToDraw === 'default') {
          playSound('unclick')
        }

        ctx.drawImage(image.images[stateToDraw], rect.x, rect.y)
        lastDrawnState[layoutKey] = stateToDraw
      }
    }
  }
}
