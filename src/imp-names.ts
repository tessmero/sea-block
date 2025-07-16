/**
 * @file imp-names.ts
 *
 * Names for implementations of certain base classes.
 *
 * Used to support to static registery pattern in base classes.
 * Base classes define a static register method that implementations call.
 */

// configurables
export const CONFIGURABLE_NAMES = [
  'sea-block', 'gfx', 'grid', 'michael', 'physics', 'free-cam', 'flora',
] as const
export type ConfigurableName = (typeof CONFIGURABLE_NAMES)[number]

// games
export const GAME_NAMES = [
  'start-sequence', 'free-cam', 'sphere-test', 'tile-inspector', 'splash-screen',
] as const
export type GameName = (typeof GAME_NAMES)[number]

// terrain generators
export const GENERATOR_NAMES = [
  'Michael2-3B', 'space-quest', 'all-ocean', 'flora-test',
] as const
export type GeneratorName = (typeof GENERATOR_NAMES)[number]

// grid tilings
export const TILING_NAMES = [
  'triangle', 'square', 'hex', 'octagon',
] as const
export type TilingName = (typeof TILING_NAMES)[number]

// transition effects
export const TRANSITION_NAMES = [
  'flat', 'drop',
] as const
export type TransitionName = (typeof TRANSITION_NAMES)[number]

// core does not use registries

// // core groups (repeated physics/graphics objects)
// export const GROUP_NAMES = [
//   'tile', 'sphere', 'flora',
// ] as const
// export type GroupName = (typeof GROUP_NAMES)[number]

// // core simulations (dynamic physics for groups)
// export const SIM_NAMES = [
//   'water', 'sphere', 'flora',
// ] as const
// export type SimName = (typeof SIM_NAMES)[number]
