/**
 * @file flat-gui-gfx-helper.ts
 *
 * Helper to display elements on the front layer and
 * only redraw elements that have changed state.
 *
 * Also triggers click/unclick sound effects.
 */

import type { SeaBlock } from 'sea-block'
import { playSound } from 'audio/sound-effects'
import type { ButtonState, ElementId, Gui, GuiElement } from 'guis/gui'
import type { SpriteAtlasGui } from 'guis/imp/sprite-atlas-gui'
import { getElementImageset } from './element-imageset-builder'

// export const loadedImagesets: Record<string, ElementImageset> = {} // populated at startup

let lastDrawnState: Partial<Record<string, ButtonState>> = {} // for purposes of requesting repaint
const shownAsPressed: Partial<Record<string, boolean>> = {} // for purposes of click/unclick sounds
export function resetFrontLayer() {
  lastDrawnState = {}
}

export function resetLastDrawnStates(gui: Gui) {
  for (const id in gui.elements) {
    delete lastDrawnState[id]
  }
}

export function updateFrontLayer(seaBlock: SeaBlock) {
  if (!seaBlock.didLoadAssets) {
    // do nothing
    return
  }

  const { layeredViewport } = seaBlock
  const { ctx } = layeredViewport

  // draw back-most gui layer first
  for (const gui of ([...seaBlock.getLayeredGuis()]).reverse()) {
    const overrideLayout = gui.overrideLayoutRectangles
    const layout = gui.layoutRectangles
    const occlusions = gui.elementOcclusions // occlusions within layer

    for (const id in gui.elements) {
      const elem: GuiElement = gui.elements[id]
      const { display, layoutKey } = elem
      if ('isVisible' in display && !display.isVisible) {
        continue // isVisible set to false
      }

      if (display.forcedSliderState && 'slideIn' in elem) {
        const { slideIn } = elem
        const { x, y } = display.forcedSliderState
        const { w, h } = layout[layoutKey]
        const container = overrideLayout[slideIn] || layout[slideIn]
        overrideLayout[layoutKey] = {
          x: container.x + x * (container.w - w),
          y: container.y + y * (container.h - h),
          w, h,
        }
        display.forcedSliderState = undefined
      }
      const rect = overrideLayout[layoutKey] || layout[layoutKey]
      if (!rect) {
        continue // not in current layout
      }

      let stateToDraw = gui.getElementState(id as ElementId)
      const imageset = getElementImageset({
        ...display,
        w: rect.w, h: rect.h,
      })

      // const imageset = loadedImagesets[id]
      // if (!imageset) {
      //   continue // not yet loaded or not visible
      // }

      if (!(stateToDraw in imageset)) {
        stateToDraw = 'default'
      }

      if (display.needsUpdate) {
        display.needsUpdate = false
        delete lastDrawnState[id]
      }
      if (display.forcedState) {
        stateToDraw = display.forcedState
      }

      const lastState = lastDrawnState[id]
      if (stateToDraw !== lastState) {
        // console.log(layoutKey, JSON.stringify(rect))

        if (stateToDraw === 'pressed' && !shownAsPressed[id]) {
          playSound('click')
          shownAsPressed[id] = true
        }
        else if (stateToDraw !== 'pressed' && shownAsPressed[id]) {
          playSound('unclick')
          shownAsPressed[id] = false
        }

        if (stateToDraw === 'hovered') {
          // console.log(`hover on ${layoutKey}`)
        }

        // special case for joystick regions: clear rectangle
        if (display.type === 'joyRegion') {
          ctx.clearRect(rect.x, rect.y, rect.w, rect.h)
        }

        if (display.type === 'sprite-atlas') {
          (gui as SpriteAtlasGui).drawAtlasView(ctx, rect)
        }
        else {
          // not sprite-atlas
          // console.log(`drawing element with layout key ${layoutKey} state ${stateToDraw}`)
          ctx.drawImage(
            imageset[stateToDraw] as CanvasImageSource,
            rect.x,
            rect.y,
          )
        }

        lastDrawnState[id] = stateToDraw

        // queue update for overlapping elements in front (should be later in this loop)
        for (const occludingId of occlusions[id]) {
          delete lastDrawnState[occludingId]

          // console.log(`redraw (${id}) occluded by (${occludingId})`)
        }
      }
    }
  }
}
