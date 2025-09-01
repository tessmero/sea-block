/**
 * @file ggui-nav-circular.ts
 *
 * Gamepad Graphical User Interface navigator.
 * Navigates GUIs with 2D analog joystick input.
 */

import type { SeaBlock } from 'sea-block'
import { gamepadState } from './gamepad-input'
import { navigateGuiWithGamepad } from './ggui-nav-wasd'

function getAngleDelta(angle1, angle2) {
  let delta = angle2 - angle1

  // Normalize delta to be within -2*PI to 2*PI
  delta = delta % (2 * Math.PI)

  // Adjust delta to be within -PI to PI for shortest path
  if (delta > Math.PI) {
    delta -= 2 * Math.PI
  }
  else if (delta < -Math.PI) {
    delta += 2 * Math.PI
  }

  return delta
}

// Direction angles in radians
const DIR_ANGLES = {
  up: -Math.PI / 2,
  down: Math.PI / 2,
  left: Math.PI,
  right: 0,
}

let lastDir: keyof typeof DIR_ANGLES | undefined = undefined

// navigate with analog direction
export function navigateWithStick(seaBlock: SeaBlock) {
  const x = gamepadState['AxisLX'] as number
  const y = gamepadState['AxisLY'] as number
  if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) {
    // seaBlock.isUsingGamepad = false
    lastDir = undefined
    return
  }

  // stick is not in neutral position
  seaBlock.isUsingGamepad = true
  const angle = Math.atan2(y, x)

  // Find nearest direction
  let nearestDir: keyof typeof DIR_ANGLES = 'right'
  let minDelta = Infinity
  for (const [dir, dirAngle] of Object.entries(DIR_ANGLES)) {
    const delta = Math.abs(getAngleDelta(angle, dirAngle))
    if (delta < minDelta) {
      minDelta = delta
      nearestDir = dir as keyof typeof DIR_ANGLES
    }
  }

  // debug
  // console.log(`treating joystick event as ${nearestDir} wasd button`)

  // check for stick held in same direction since last navigation
  if (nearestDir === lastDir) {
    return
  }

  // stick has moved and should count as navigation attempt
  lastDir = nearestDir

  // translate to wasd
  if (nearestDir === 'left')
    navigateGuiWithGamepad(seaBlock, 'AxisLX', -1, angle)
  if (nearestDir === 'right')
    navigateGuiWithGamepad(seaBlock, 'AxisLX', 1, angle)
  if (nearestDir === 'up')
    navigateGuiWithGamepad(seaBlock, 'AxisLY', -1, angle)
  if (nearestDir === 'down')
    navigateGuiWithGamepad(seaBlock, 'AxisLY', 1, angle)
}
