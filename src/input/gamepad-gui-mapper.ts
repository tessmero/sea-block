/**
 * @file gamepad-gui-mapper.ts
 *
 * Help make mouse/touch GUIs usable with just gamepad or just keyboard.
 * The mouse hovering graphics are used as a cursor.
 */

import type { GameUpdateContext } from 'games/game'
import type { ElementId, GuiElement } from 'guis/gui'
import type { SeaBlock } from 'sea-block'
import type { InputId } from './input-id'

// deadzone for any physical joysticks controlling gui
export const guiNavJoystickDeadzone = 0.1

export const minDelay = 250 // required ms between navigation events
let lastNavTime = 0 // system time of last event

let selectedId: ElementId | undefined = undefined
let selectedElem: GuiElement | undefined = undefined

// attempts to move cursor
const navInputs: Array<InputId> = [
  'AxisLX', 'AxisLY', 'AxisRX', 'AxisRY',
  'DPadDown', 'DPadUp', 'DPadLeft', 'DPadRight',
]

// counts as click
const selectInputs: Array<InputId> = [
  'ButtonA', 'ButtonStart', 'ButtonLB', 'ButtonRB',
]

export function navigateGuiWithGamepad(seaBlock: SeaBlock,
  inputId: InputId, // button/axis
  _axisValue?: number, // state of analog axis
) {
  // check for rapid input
  const t = performance.now()
  const delay = t - lastNavTime
  if (delay < minDelay) {
    return // ignore rapid input
  }
  lastNavTime = t

  // check for repeated joystick input

  if (navInputs.includes(inputId)) {
    // input counts as navigatio, attempt to change selection.
    const allClickables = getClickableElements(seaBlock)
    selectSomething(seaBlock, allClickables, selectedId) // something other than selected
  }

  else if (selectInputs.includes(inputId)) {
    // input counts as click
    if (selectedElem && selectedElem.clickAction) {
      // emulate click on selected element
      selectedElem.display.forcedState = 'pressed'
      selectedElem.display.needsUpdate = true
      selectedElem.clickAction({ seaBlock })
    }
  }
}

export function updateGamepadGui(context: GameUpdateContext) {
  const { seaBlock } = context

  const allClickables = getClickableElements(seaBlock)
  if (selectedId && !(selectedId in allClickables)) {
    // selected element is no longer clickable (possibly switched guis)

    // release selected element
    if (!selectedElem) {
      throw new Error('have set selectedId but not selectedElem')
    }
    selectedElem.display.forcedState = undefined
    selectedElem = undefined
    selectedId = undefined

    // attempt to select something relevant
    selectSomething(seaBlock, allClickables)
  }
}

function selectSomething(
  seaBlock: SeaBlock,
  allClickables: Record<string, GuiElement>,
  exclude?: ElementId,
) {
  // get some clickable button
  for (const [id, elem] of Object.entries(allClickables)) {
    if (id === exclude) continue // skip excluded element
    const { display } = elem
    if (display.type === 'button' && elem.clickAction && display.isVisible) {
      if (selectedElem) {
        // release old element
        selectedElem.display.forcedState = undefined
        selectedElem.display.needsUpdate = true
      }

      selectedId = id as ElementId
      selectedElem = elem

      // hover new element
      selectedElem.display.forcedState = 'hovered'
      selectedElem.display.needsUpdate = true

      // gamepadCursor.set(x + w / 2, y + h / 2) // place virtual cursor on center

      return
    }
  }
}

function getClickableElements(seaBlock: SeaBlock): Record<string, GuiElement> {
  const result: Record<string, GuiElement> = {}
  for (const gui of seaBlock.getLayeredGuis()) {
    for (const [id, elem] of Object.entries(gui.elements)) {
      const { display } = elem
      if (display.type === 'button' && elem.clickAction && display.isVisible) {
        result[id] = elem
      }
    }
  }
  return result
}
