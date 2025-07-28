/**
 * @file joysticks.ts
 *
 * Sliders used as virtual joysticks in free-cam-gui.
 */

import type { ElementEvent, GuiElement, Slider } from 'guis/gui'
import type { SeaBlock } from 'sea-block'

export const joyInputState = {
  left: { x: 0.5, y: 0.5 }, // neutral
  right: { x: 0.5, y: 0.5 },
}

// deadzones (distances from neutral) where input is ignored
export const leftDead = 0.1
const leftDeadSq = Math.pow(leftDead, 2)
const rightYDead = 0.2 // usually don't want to pitch up or down
const rightXDead = 0.05 // usually do want to rotate left or right

export const leftJoy: GuiElement = {
  display: { type: 'joyRegion' },
  layoutKey: 'leftJoy',
  hotkeys: [],
}

export const leftJoySlider: Slider = {

  display: { type: 'button', icon: 'icons/16x16-pan.png' },
  layoutKey: 'leftJoySlider',
  slideIn: 'leftJoy',
  hotkeys: [],
  clickAction: slideLeft,
  dragAction: slideLeft,
  unclickAction: () => {
    leftJoy.display.needsUpdate = true
    leftJoy.display.forcedState = undefined
    joyInputState.left.x = 0.5
    joyInputState.left.y = 0.5
  },
}

export const rightJoy: GuiElement = {
  display: { type: 'joyRegion' },
  layoutKey: 'rightJoy',
  hotkeys: [],
}

export const rightJoySlider: Slider = {

  display: { type: 'button', icon: 'icons/16x16-rotate.png' },
  layoutKey: 'rightJoySlider',
  slideIn: 'rightJoy',
  hotkeys: [],
  clickAction: event => slideRight(event),
  dragAction: event => slideRight(event),
  unclickAction: () => {
    rightJoy.display.needsUpdate = true
    rightJoy.display.forcedState = undefined
    joyInputState.right.x = 0.5
    joyInputState.right.y = 0.5
  },
}

function slideLeft(event: ElementEvent) {
  const { sliderState } = event
  if (sliderState) {
    // update input state
    const { slider, container } = sliderState
    joyInputState.left.x = (slider.x - container.x) / (container.w - slider.w)
    joyInputState.left.y = (slider.y - container.y) / (container.h - slider.h)
  }

  leftJoy.display.needsUpdate = true
  leftJoy.display.forcedState = 'pressed'
}

function slideRight(event: ElementEvent) {
  const { sliderState } = event
  if (sliderState) {
    // update input state
    const { slider, container } = sliderState
    joyInputState.right.x = (slider.x - container.x) / (container.w - slider.w)
    joyInputState.right.y = (slider.y - container.y) / (container.h - slider.h)
  }

  rightJoy.display.needsUpdate = true
  rightJoy.display.forcedState = 'pressed'
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
