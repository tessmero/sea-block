/**
 * @file gamepad-input.ts
 *
 * Handle joystick/trigger/button inputs from physical controller device.
 */

import type { SeaBlock } from 'sea-block'
import { GAMEPAD_AXES, GAMEPAD_BUTTONS, GAMEPAD_CODES, GAMEPAD_TRIGGERS } from './input-id'
import type { GamepadCode } from './input-id'
import { joyInputState, leftJoy, leftJoySlider, rightJoy, rightJoySlider } from 'guis/elements/joysticks'
import type { GuiElement, Slider, SliderState } from 'guis/gui'
import { guiNavJoystickDeadzone, navigateGuiWithGamepad } from './gamepad-gui-mapper'

export const gamepadState = {} as Record<GamepadCode, boolean | number>
for (const code of GAMEPAD_CODES) {
  gamepadState[code] = false
}

// Store previous button states for edge detection
const prevButtonStates: Record<GamepadCode, boolean> = (() => {
  const obj = {} as Record<GamepadCode, boolean>
  for (const code of GAMEPAD_CODES) {
    obj[code] = false
  }
  return obj
})()

export function updateGamepadState(seaBlock: SeaBlock) {
  // console.log(`start polling gamepad`)
  // const startTime = performance.now()

  const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
  for (const gp of gamepads) {
    if (!gp) continue
    // Buttons
    for (const [name, idx] of Object.entries(GAMEPAD_BUTTONS)) {
      const code = name as GamepadCode
      const isPressed = !!gp.buttons[idx]?.pressed
      gamepadState[code] = isPressed
      // Edge detection for keydown/keyup
      if (isPressed && !prevButtonStates[code]) {
        // Button pressed
        if (seaBlock?.game?.gui?.keydown) {
          seaBlock.isUsingGamepad = true
          seaBlock.game.gui.keydown(seaBlock, code)
          navigateGuiWithGamepad(seaBlock, code as GamepadCode)
        }
      }
      else if (!isPressed && prevButtonStates[code]) {
        // Button released
        if (seaBlock?.game?.gui?.keyup) {
          seaBlock.game.gui.keyup(seaBlock, code)
        }
      }
      prevButtonStates[code] = isPressed
    }
    // Triggers (analog)
    for (const [name, idx] of Object.entries(GAMEPAD_TRIGGERS)) {
      const value = gp.buttons[idx]?.value ?? 0
      gamepadState[name as GamepadCode] = value
    }
    // Axes (analog value)
    for (const [axis, idx] of Object.entries(GAMEPAD_AXES)) {
      const value = gp.axes[idx] ?? 0
      if (Math.abs(value) > guiNavJoystickDeadzone) {
        seaBlock.isUsingGamepad = true
        navigateGuiWithGamepad(seaBlock, axis as GamepadCode, value)
      }
      gamepadState[axis] = value
    }

    // pass state to virtual joysticks logic/display
    updateStick(seaBlock,
      gamepadState.AxisLX as number,
      gamepadState.AxisLY as number,
      leftJoy, leftJoySlider, 'left',
    )
    updateStick(seaBlock,
      gamepadState.AxisRX as number,
      gamepadState.AxisRY as number,
      rightJoy, rightJoySlider, 'right',
    )
  }

  // const endTime = performance.now()
  // console.log(`gamepad polling took ${endTime-startTime} ms`)
}

function updateStick(
  seaBlock: SeaBlock, rawX: number, rawY: number,
  region: GuiElement, slider: Slider, name: 'left' | 'right',
) {
  if (Math.abs(rawX) > 0.01 || Math.abs(rawY) > 0.01) {
    // limit radius
    const mag = Math.hypot(rawX, rawY)
    if (mag > 1) {
      rawX /= mag
      rawY /= mag
    }

    // set logical state for joysticks
    joyInputState[name] = { x: rawX / 2 + 0.5, y: rawY / 2 + 0.5 }

    // set state for onscreen joystick display
    slider.display.forcedSliderState = joyInputState[name]
    region.display.forcedState = 'pressed'
    slider.display.forcedState = 'pressed'
    region.display.needsUpdate = true
  }
  else if (slider.display.forcedState === 'pressed') {
    // release onscreen joystick display
    region.display.needsUpdate = true
    region.display.forcedState = undefined
    slider.display.forcedState = undefined
    joyInputState[name] = neutral
    delete seaBlock.game.gui.overrideLayoutRectangles[`${name}JoySlider`]
  }
}

const neutral = {
  x: 0.5, y: 0.5,
} as const satisfies SliderState
