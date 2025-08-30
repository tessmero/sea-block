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
export function resetFrontLayer(seaBlock: SeaBlock) {
  lastDrawnState = {}
  const { w, h } = seaBlock.layeredViewport
  seaBlock.layeredViewport.ctx.clearRect(0, 0, w, h)
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

      // get live position of element on screen
      let rect = overrideLayout[layoutKey] || layout[layoutKey]

      if (display.forcedSliderState && 'slideIn' in elem) {
        const { slideIn } = elem
        const { x, y } = display.forcedSliderState
        const { w, h } = rect // layout[layoutKey]
        const container = overrideLayout[slideIn] || layout[slideIn]
        rect = {
          x: container.x + x * (container.w - w),
          y: container.y + y * (container.h - h),
          w, h,
        }
        overrideLayout[layoutKey] = rect
        display.forcedSliderState = undefined
      }

      // assign rectangle for purposes of gamepad/keyboard navigation
      if (elem.gamepadNavBox) {
        elem.gguiNavRectangle = overrideLayout[elem.gamepadNavBox] || layout[elem.gamepadNavBox]
      }
      else {
        elem.gguiNavRectangle = rect
      }

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
        if (display.shouldClearBehind) {
          ctx.clearRect(rect.x, rect.y, rect.w, rect.h)
        }
        if (display.type === 'sprite-atlas') {
          (gui as SpriteAtlasGui).drawAtlasView(ctx, rect)
        }
        else {
          // not sprite-atlas
          // console.log(`drawing element with layout key ${layoutKey} state ${stateToDraw}`)
          display.isVisible = true
          elem.rectangle = rect
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
