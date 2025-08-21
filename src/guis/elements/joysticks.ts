/**
 * @file joysticks.ts
 *
 * Sliders used as virtual joysticks in free-cam-gui.
 */

import type { ElementEvent, GuiElement, Slider, SliderState } from 'guis/gui'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'
import type { SeaBlock } from 'sea-block'

// centered stick position
const neutral = {
  x: 0.5, y: 0.5,
} as const satisfies SliderState

// current state of the two joysticks
export const joyInputState: Record<'left' | 'right', SliderState> = {
  left: neutral,
  right: neutral,
}

// deadzones (distances from neutral) where input is ignored
export const leftDead = 0.1
const leftDeadSq = Math.pow(leftDead, 2)
const rightYDead = 0.2 // usually don't want to pitch up or down
const rightXDead = 0.05 // usually do want to rotate left or right

// left touch region
export const leftJoy: GuiElement<FreecamLayoutKey> = {
  display: {
    type: 'joy-region',
    border: '16x16-btn-square',
    shouldClearBehind: true,
  },
  layoutKey: 'leftJoy',
  hotkeys: [],
}

// left draggable element
export const leftJoySlider: Slider<FreecamLayoutKey> = {
  display: {
    type: 'button',
    icon: 'icons/16x16-pan.png',
    border: '16x16-btn-shiny',
  },
  layoutKey: 'leftJoySlider',
  slideIn: 'leftJoy',
  slideRadius: 12,
  hotkeys: [],
  clickAction: slideLeft,
  dragAction: slideLeft,
  unclickAction: () => {
    leftJoy.display.needsUpdate = true
    leftJoy.display.forcedState = undefined
    joyInputState.left = neutral
  },
}

// right touch region
export const rightJoy: GuiElement<FreecamLayoutKey> = {
  display: {
    type: 'joy-region',
    border: '16x16-btn-square',
    shouldClearBehind: true,
  },
  layoutKey: 'rightJoy',
  hotkeys: [],
}

// right draggable element
export const rightJoySlider: Slider<FreecamLayoutKey> = {
  display: {
    type: 'button',
    icon: 'icons/16x16-rotate.png',
    border: '16x16-btn-shiny',
  },
  layoutKey: 'rightJoySlider',
  slideIn: 'rightJoy',
  slideRadius: 12,
  hotkeys: [],
  clickAction: event => slideRight(event),
  dragAction: event => slideRight(event),
  unclickAction: () => {
    rightJoy.display.needsUpdate = true
    rightJoy.display.forcedState = undefined
    joyInputState.right = neutral
  },
}

function slideLeft(event: ElementEvent) {
  const { sliderState } = event
  if (sliderState) {
    joyInputState.left = sliderState
    leftJoy.display.needsUpdate = true
    leftJoy.display.forcedState = 'pressed'
  }
}

function slideRight(event: ElementEvent) {
  const { sliderState } = event
  if (sliderState) {
    joyInputState.right = sliderState
    rightJoy.display.needsUpdate = true
    rightJoy.display.forcedState = 'pressed'
  }
}

// get signed left joystick state after accounting for deadzone
export function getLeftJoystickInput(): { x: number, y: number } | null {
  const { x, y } = joyInputState.left
  const dx = (x - 0.5)
  const dy = (y - 0.5)
  const d2 = dx * dx + dy * dy
  if (d2 < leftDeadSq) {
    return null
  }
  return { x: dx, y: dy }
}

export function orbitWithRightJoystick(seaBlock: SeaBlock, dt: number) {
  const orbitControls = seaBlock.orbitControls as unknown as HackedOrbitControls
  const { x, y } = joyInputState.right
  let dx = (x - 0.5)
  if (Math.abs(dx) > rightXDead) {
    dx = Math.sign(dx) * (Math.abs(dx) - rightXDead)
    orbitControls._rotateLeft(5e-3 * dx * dt)
  }
  let dy = (y - 0.5)
  if (Math.abs(dy) > rightYDead) {
    dy = Math.sign(dy) * (Math.abs(dy) - rightYDead)
    orbitControls._rotateUp(5e-3 * dy * dt)
  }
}

// expose private methods of OrbitControls
type HackedOrbitControls = {
  _rotateLeft: (angle: number) => void
  _rotateUp: (angle: number) => void
}
