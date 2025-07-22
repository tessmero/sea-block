/**
 * @file input-id.ts
 *
 * Definition of "Input Identifier" for any single unit of input.
 */

export type InputId
  = number // touch id number
    | KeyCode // keyboard button
    | 'mouse' // mouse

// event.code values for bindable keyboard keys
export const KEY_CODES = [
  'Escape', 'Space', 'KeyM',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyS', 'KeyA', 'KeyD',
] as const
export type KeyCode = (typeof KEY_CODES)[number]
