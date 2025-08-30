/**
 * @file input-id.ts
 *
 * Definition of "Input Identifier" for any single unit of input.
 */

export type InputId
  = number // touch id number
    | KeyCode // keyboard button
    | GamepadCode // gamepad button/axis
    | 'mouse' // mouse

// event.code values for bindable keyboard keys
export const KEY_CODES = [
  'Escape', 'Space', 'KeyM',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyS', 'KeyA', 'KeyD',
] as const
export type KeyCode = (typeof KEY_CODES)[number]

// Gamepad button/axis codes for bindable gamepad inputs
export const GAMEPAD_CODES = [
  // Standard Gamepad buttons
  'ButtonA', 'ButtonB', 'ButtonX', 'ButtonY',
  'ButtonLB', 'ButtonRB',
  'ButtonBack', 'ButtonStart', 'ButtonLS', 'ButtonRS',
  'DPadUp', 'DPadDown', 'DPadLeft', 'DPadRight',
  // trigger axes
  'ButtonLT', 'ButtonRT',
  // joystick axes
  'AxisLX', 'AxisLY', 'AxisRX', 'AxisRY',
] as const
export type GamepadCode = (typeof GAMEPAD_CODES)[number]

// Gamepad button name to index mapping
export const GAMEPAD_BUTTONS = {
  ButtonA: 0,
  ButtonB: 1,
  ButtonX: 2,
  ButtonY: 3,
  ButtonLB: 4,
  ButtonRB: 5,
  ButtonBack: 8,
  ButtonStart: 9,
  ButtonLS: 10,
  ButtonRS: 11,
  DPadUp: 12,
  DPadDown: 13,
  DPadLeft: 14,
  DPadRight: 15,
} as const satisfies Partial<Record<GamepadCode, number>>

// Gamepad trigger name to index mapping
export const GAMEPAD_TRIGGERS = {
  ButtonLT: 6,
  ButtonRT: 7,
} as const satisfies Partial<Record<GamepadCode, number>>

// Gamepad axis name to index mapping
export const GAMEPAD_AXES = {
  AxisLX: 0,
  AxisLY: 1,
  AxisRX: 2,
  AxisRY: 3,
} as const satisfies Partial<Record<GamepadCode, number>>
