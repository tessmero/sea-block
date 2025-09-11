/**
 * @file gui-layers.ts
 *
 * Helpers to pick active guis, order them in layers, and pass mouse/touch input to them.
 */

import { Gui } from 'guis/gui'
import type { ProcessedSubEvent } from 'input/mouse-touch-input'

// get visible guis starting with the front-most
export function getLayeredGuis(seaBlock): ReadonlyArray<Gui> {
  const result = [seaBlock.game.gui]

  const { testGui } = seaBlock.config.flatConfig
  if (testGui === 'sprite-atlas') {
    return [Gui.create('sprite-atlas')] // show sprite atlas alone
    // result.unshift(Gui.create('sprite-atlas'))
  }

  if (seaBlock.isShowingSettingsMenu) {
    result.unshift(Gui.create('settings-menu')) // show settings menu on top
  }

  return result
  // if (seaBlock.isSettingsMenuVisible && settingsGui) {
  //   return [
  //     settingsGui,
  //     seaBlock.game.gui,
  //   ]
  // }

  // return [
  //   seaBlock.game.gui,
  // ]
}

// allow gui layers to consume click/touch before orbit controls (mouse-touch-input.ts)
export function clickGuiLayers(event: ProcessedSubEvent): boolean {
  for (const gui of getLayeredGuis(event.seaBlock)) {
    if (gui.click(event)) {
      return true // consume event
    }
  }
  return false // pass to orbit controls
}

export function unclickGuiLayers(event: ProcessedSubEvent) {
  for (const gui of getLayeredGuis(event.seaBlock)) {
    gui.unclick(event)
  }
}

// allow gui layers to consume drag before orbit controls (mouse-touch-input.ts)
export function mouseMoveGuiLayers(event: ProcessedSubEvent): boolean {
  document.documentElement.style.cursor = 'default'
  for (const gui of getLayeredGuis(event.seaBlock)) {
    if (gui.move(event)) { // may set cursor to pointer
      return true // consume event
    }
  }
  return false // pass to orbit controls
}
