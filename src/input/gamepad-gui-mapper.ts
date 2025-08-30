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
import { Vector2 } from 'three'
import type { Rectangle } from 'util/layout-parser'

// deadzone for any physical joysticks controlling gui
export const guiNavJoystickDeadzone = 0.3

export const minDelay = 10 // required ms between navigation events
let lastNavTime = 0 // system time of last event

let selectedId: ElementId | undefined = undefined
let selectedElem: GuiElement | undefined = undefined
let isHorizontalSlider = false

// attempts to move cursor
const navInputs = {

  AxisLX: ['left', 'right'],
  AxisLY: ['up', 'down'],
  AxisRX: ['left', 'right'],
  AxisRY: ['up', 'down'],

  DPadDown: ['down'],
  DPadUp: ['up'],
  DPadLeft: ['left'],
  DPadRight: ['right'],

} as const satisfies Partial<Record<InputId, Array<Direction>>>

type Direction = 'up' | 'down' | 'left' | 'right'

// counts as click
const selectInputs: Array<InputId> = [
  'ButtonA', 'ButtonStart', 'ButtonLB', 'ButtonRB',
]

type Sign = -1 | 0 | 1

// get sign from joystick axis value centered at 0.5
const getSign = (val: number) => Math.sign(val - 0.5) as Sign

const lastAxisSign: Partial<Record<InputId, Sign>> = {}

// called on active input
export function navigateGuiWithGamepad(seaBlock: SeaBlock,
  inputId: InputId, // button/axis
  axisValue?: number, // state of analog axis
) {
  if (typeof axisValue === 'number') {
    if (Math.abs(axisValue) < guiNavJoystickDeadzone) {
      // joystick is in deadzone
      lastAxisSign[inputId] = 0
      return
    }
    else {
      // joystick is being held beyond deadzone
      seaBlock.isUsingGamepad = true
    }
  }

  // check for rapid input
  const t = performance.now()
  const delay = t - lastNavTime
  if (delay < minDelay) {
    return // ignore rapid input
  }
  lastNavTime = t

  // check for joystick changing position but still in same direction
  if (axisValue) {
    const sign = getSign(axisValue)
    if (lastAxisSign[inputId] === sign) {
      return // ignore
    }
    lastAxisSign[inputId] = sign
  }

  if (inputId in navInputs) {
    // input counts as navigation or slide
    const direction = _getDirection(navInputs[inputId], axisValue)

    // check if input should move slider instead of navigate
    if (selectedElem && isHorizontalSlider && (direction === 'left' || direction === 'right')) {
      // get current slider state
      const slider = selectedElem.rectangle as Rectangle
      const container = selectedElem.gguiNavRectangle as Rectangle
      let sliderState = selectedElem.display.forcedSliderState || {
        x: (slider.x - container.x) / ((container.w - slider.w) || 1),
        y: (slider.y - container.y) / ((container.h - slider.h) || 1),
      }

      // console.log(`old sliderstate: ${JSON.stringify(sliderState)}`)

      // move slider
      const [dx, _dy] = directionDeltas[direction]
      sliderState = {
        x: Math.max(0, Math.min(1, sliderState.x + 0.1 * dx)),
        y: 0,
      }

      // console.log(direction, dx)

      // console.log(`new sliderstate: ${JSON.stringify(sliderState)}`)

      selectedElem.display.forcedSliderState = sliderState
      selectedElem.display.needsUpdate = true
      if (selectedElem.dragAction) {
        selectedElem.dragAction({
          seaBlock, sliderState,
        })
      }

      // debug
      for (const gui of seaBlock.getLayeredGuis()) {
        for (const elem of Object.values(gui.elements)) {
          elem.display.needsUpdate = true
        }
      }

      return // don't navigate
    }

    // attempt to change selection.
    const allClickables = _getClickableElements(seaBlock)
    selectNeighbor(seaBlock, allClickables, direction) // somethign in that direction
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

function _getDirection(arr: Array<Direction>, axisValue?: number): Direction {
  if (arr[1] && axisValue && getSign(axisValue) === 1) {
    return arr[1]
  }
  return arr[0]
}

// called periodically
export function updateGamepadGui(context: GameUpdateContext) {
  const { seaBlock } = context

  if (!seaBlock.isUsingGamepad) {
    _releaseSelected()
    return
  }

  // un-hover mouse until next mouse move
  seaBlock.getLayeredGuis().forEach(gui => gui.hovered = undefined)

  const allClickables = _getClickableElements(seaBlock)
  if (selectedId && !(selectedId in allClickables)) {
    // selected element is no longer clickable (possibly switched guis)

    _releaseSelected()

    // attempt to select something relevant
    selectSomething(seaBlock, allClickables)
  }
}

const directionDeltas: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
}

function selectNeighbor(
  seaBlock: SeaBlock,
  allClickables: Record<string, GuiElement>,
  direction: Direction,
) {
  if (!selectedElem) {
    return selectSomething(seaBlock, allClickables)
  }

  // find starting point
  if (!selectedElem.gguiNavRectangle) {
    // unable to locate starting point
    return selectSomething(seaBlock, allClickables, selectedId)
  }

  // pick point to check for neighbor
  const { x, y, w, h } = selectedElem.gguiNavRectangle
  const [dx, dy] = directionDeltas[direction]

  // start at edge of current element
  const x0 = (x + w / 2) + (w / 2 * dx)
  const y0 = (y + h / 2) + (h / 2 * dy)

  // step in desired direction
  const stepSize = 1
  const screenWidth = seaBlock.layeredViewport.w
  const screenHeight = seaBlock.layeredViewport.h
  for (let stepIndex = 0; stepIndex < checkPoints.length; stepIndex++) {
    checkPoints[stepIndex].set(
      (x0 + dx * (stepIndex + 1) * stepSize) % screenWidth,
      (y0 + dy * (stepIndex + 1) * stepSize) % screenHeight,
    )
  }

  // check for neighbor
  const picked = _pickElement(allClickables, checkPoints)
  if (picked) {
    _select(picked, allClickables[picked])
  }
}

const checkPoints = Array.from({ length: 1000 }, () => new Vector2())

function _releaseSelected() {
  if (!selectedElem) {
    return
  }
  selectedElem.display.forcedState = undefined
  selectedElem.display.needsUpdate = true
  selectedElem = undefined
  selectedId = undefined
  isHorizontalSlider = false
}

function _select(id: ElementId, elem: GuiElement) {
  _releaseSelected()

  selectedId = id
  selectedElem = elem

  // check if slider
  isHorizontalSlider = false
  if ('slideIn' in elem && elem.rectangle && elem.gguiNavRectangle) {
    const { rectangle, gguiNavRectangle } = elem
    if (rectangle.h === gguiNavRectangle.h) {
      isHorizontalSlider = true
    }
  }

  // hover new element
  selectedElem.display.forcedState = 'hovered'
  selectedElem.display.needsUpdate = true
}

function _pickElement(
  allClickables: Record<string, GuiElement>,
  points: Array<Vector2>,
): ElementId | undefined {
  //
  for (const p of points) {
    for (const id in allClickables) {
      const elem = allClickables[id]
      if (elem.gguiNavRectangle) {
        const { x, y, w, h } = elem.gguiNavRectangle
        if ((p.x > x) && (p.x < (x + w)) && (p.y > y) && (p.y < (y + h))) {
        // console.log(`picked element: ${id} in ${this.pickable[id]}`)
        // document.documentElement.style.cursor = 'pointer'
          return id as ElementId
        }
      }
    }
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
    if (
      display.type === 'button'
      && elem.clickAction
      && display.isVisible
    ) {
      // set/replace selection
      _select(id as ElementId, elem)

      return // don't check remaining clickables
    }
  }
}

function _getClickableElements(seaBlock: SeaBlock): Record<string, GuiElement> {
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
