/**
 * @file imp-names.ts
 *
 * Names for implementations of certain base classes.
 *
 * Used to support to static registery pattern in base classes.
 * Base classes define a static register method that implementations call.
 */

// list of implementations for one base class
export type ImpManifest = {
  NAMES: Array<string> // names to pass to register() and create()
  SOURCES: Array<string> // source file patterns used in tools and tests
}

// configurables
export const CONFIGURABLE = {
  NAMES: ['sea-block', 'top', 'gfx', 'michael', 'physics', 'free-cam', 'flora'],
  SOURCES: ['src/configs/**/*.ts'],
} as const satisfies ImpManifest
export type ConfigurableName = (typeof CONFIGURABLE.NAMES)[number]

// games
export const GAME = {
  NAMES: ['start-sequence', 'free-cam', 'sphere-test', 'tile-inspector', 'splash-screen'],
  SOURCES: ['src/games/imp/**/*.ts'],
} as const satisfies ImpManifest
export type GameName = (typeof GAME.NAMES)[number]

// terrain generators
export const GENERATOR = {
  NAMES: ['Michael2-3B', 'space-quest', 'all-ocean', 'flora-test', 'flat'],
  SOURCES: ['src/generators/**/*.ts'],
} as const satisfies ImpManifest
export type GeneratorName = (typeof GENERATOR.NAMES)[number]

// grid tilings
export const TILING = {
  NAMES: ['triangle', 'square', 'hex', 'octagon'],
  SOURCES: ['src/core/grid-logic/tilings/**/*.ts'],
} as const satisfies ImpManifest
export type TilingName = (typeof TILING.NAMES)[number]

// grid animations
export const GRID_ANIM = {
  NAMES: ['radial-height-warp', 'flat-sweep', 'random-sweep', 'radial-sweep'],
  SOURCES: ['src/gfx/grid-anims/**/*.ts'],
} as const satisfies ImpManifest
export type GridAnimName = (typeof GRID_ANIM.NAMES)[number]

// transition animation sequences
export const TRANSITION = {
  NAMES: ['flat', 'drop', 'ssd'],
  SOURCES: [
    'src/gfx/2d/flat-transition.ts',
    'src/gfx/3d/drop-transition.ts',
    'src/gfx/ssd-transition.ts',
  ],
} as const satisfies ImpManifest
export type TransitionName = (typeof TRANSITION.NAMES)[number]

// user interfaces
export const GUI = {
  NAMES: [
    'free-cam', 'splash-screen', 'start-sequence',
    'empty', // placeholder used for games without gui
    'settings-menu', 'sprite-atlas', // test guis 2025-07-28
  ],
  SOURCES: ['src/guis/imp/**/*.ts'],
} as const satisfies ImpManifest
export type GuiName = (typeof GUI.NAMES)[number]

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
