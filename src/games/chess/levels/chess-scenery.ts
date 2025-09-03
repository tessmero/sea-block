/**
 * @file chess-scenery.ts
 *
 * Help adjust configs betwen chess levels to change
 * the terrain and style.
 */

import { ChessTG, type ChessTGMods } from 'generators/chess-tg'
import type { SeaBlock } from 'sea-block'
import type { Snapshot } from 'util/config-snapshot-helper'
import { restoreSnapshot, saveSnapshot } from 'util/config-snapshot-helper'

let originalSnapshot
export class ChessScenery {
  public static takeOriginalSnapshot(seaBlock: SeaBlock) {
    originalSnapshot = saveSnapshot(seaBlock)
  }

  public static applyLevelScenery(seaBlock: SeaBlock, levelId: string) {
    const sceneId = CHESS_LEVEL_SCENES[levelId]
    const scene = CHESS_SCENES[sceneId] as ChessScene
    ChessTG.currentMods = scene.tgMods || {}
    restoreSnapshot(seaBlock, originalSnapshot)
    seaBlock.config.tree.children.game.value = 'chess'
    seaBlock.config.tree.children.tiling.value = 'square'
    restoreSnapshot(seaBlock, scene.snapshot)

    // restoreSnapshot(seaBlock, {
    //   style: {},
    //   config: {
    //     tiling: 'square',
    //     generator: 'chess',
    //     visibleRadius: 11,

    //     // rough sparse not reachable
    //     offsetX: -596.0186032697071,
    //     offsetZ: 1864.1684142101176,

    //     // // very rough, very close, may be reachable from multiple sides
    //     // visibleRadius: 11,
    //     // yScale: 0.34,
    //     // offsetX: -658.6491056901409,
    //     // offsetZ: 747.0363572027585,
    //     // persistence: 0.68,
    //     // wavelength: 98,

    //   },
    //   // config: {
    //   //   // generator: 'flat', // debug
    //   //   persistence: 0.51,
    //   //   wavelength: 144,
    //   //   exponent: 2.4,
    //   //   peaks: 0.15,
    //   // },
    //   // center: {
    //   //   x: 18.236732482910156,
    //   //   z: 7.742987155914307,
    //   // },
    // })

    // const { generator, gfx, michael } = seaBlock.config.tree.children
    // const { style } = gfx.children
    // const { peaks } = michael.children.terrainCustomization.children

    // generator.value = 'Michael2-3B'
    // style.value = 'pastel'
  }

  public static restoreOriginalSnapshot(seaBlock: SeaBlock) {
    if (!originalSnapshot) return
    restoreSnapshot(seaBlock, originalSnapshot)
    seaBlock.config.tree.children.gfx.children.style.value = 'default'
  }
}

type ChessScene = {
  snapshot: Snapshot
  tgMods?: ChessTGMods
}

const CHESS_SCENES = {
  'lava': {
    // all ocean, orange land, black sky
    tgMods: { isAllOcean: true },
    snapshot: {
      style: {
        background: { value: '#000' }, // black sky
        top: { hue: -0.5 }, // orange
        sides: { hue: -0.5, lightness: -0.1 }, // darker orange
      },
      config: {
        generator: 'chess',
        style: 'custom',
        visibleRadius: 11,
      },
    },
  },
  'mountain-wrap': {
    // nice wrapping mountain
    // jumpable on one side
    tgMods: { isUnwarped: true },
    snapshot: {
      style: {},
      config: {
        style: 'default',
        generator: 'chess',
        visibleRadius: 11,
        offsetX: -0.4720616551544658, // med wrap
        offsetZ: 19.402819298061146,
        exponent: 3,
      },
    },
  },
  'tight-wrap': {
    // tight wrap
    tgMods: { },
    snapshot: {
      style: {},
      config: {
        style: 'pastel',
        generator: 'chess',
        visibleRadius: 11,
        offsetX: -94.57554124214874, // tight wrap
        offsetZ: 48.587894021613195,
        exponent: 3,
      },
    },
  },
  'pringle': {
    // moon: white land, black sky
    tgMods: { isAllOcean: true, isSaddle: true },
    snapshot: {
      style: {
        background: { value: '#444' }, // very dark sky
        top: { value: '#999' },
        sides: { value: '#000' },
      },
      config: {
        generator: 'chess',
        style: 'custom',
        visibleRadius: 11,
      },
    },
  },
  'gumball': {
    // gumball: pink land, pastel sky
    snapshot: {
      style: {
        background: { hue: -0.25, saturation: '+0.2', lightness: '+0.3' }, // pastel pink sky (rotate blue toward pink)
        top: { hue: -0.25, saturation: '+0.7', lightness: '+0.1' }, // pink
        sides: { hue: -0.25, saturation: '+0.5', lightness: '-0.1' }, // darker pink
      },
      config: {
        generator: 'chess',
        style: 'custom',
        visibleRadius: 11,
      },
    },
  },
  'neon-pastel': {
    // lava: yellow sides, orange-red top, dark sky
    snapshot: {
      style: {
        'background': { value: '#222' }, // dark background
        'top': { hue: -0.1, saturation: '+0.5', lightness: '+0.2' },
        'sides': { hue: -0.15, saturation: '+0.8', lightness: '+0.5' },
        'top@sea': { value: '#AACCFF' },
        'sides@sea': { value: '#aaccff73' },
      },
      config: {
        generator: 'chess',
        style: 'custom',
        visibleRadius: 11,
        // very rough very reachable
        yScale: 0.34,
        offsetX: -658.6491056901409,
        offsetZ: 747.0363572027585,
        persistence: 0.68,
        wavelength: 98,
      },
    },
  },
  'ocean': {
    // ocean: blue land, deep blue sky
    tgMods: { isAllOcean: true },
    snapshot: {
      style: {
        background: { value: '#8c0b0bff' }, // deep sunset
        sides: { lightness: -0.1 },
      },
      config: {
        generator: 'chess',
        visibleRadius: 11,
        style: 'custom',
      },
    },
  },
  'ocean-bowl': {
    // ocean: blue land, deep blue sky
    tgMods: { isAllOcean: true, isBowl: true },
    snapshot: {
      style: {
        background: { value: '#0a2233' }, // deep blue
        sides: { lightness: -0.1 },
      },
      config: {
        generator: 'chess',
        visibleRadius: 11,
        style: 'custom',
      },
    },
  },
  'rough-reachable': {
    // very rough very reachable
    snapshot: {
      style: {},
      config: {
        generator: 'chess',
        visibleRadius: 11,
        // very rough very reachable
        yScale: 0.34,
        offsetX: -658.6491056901409,
        offsetZ: 747.0363572027585,
        persistence: 0.68,
        wavelength: 98,
      },
    },
  },
} as const satisfies Record<string, ChessScene>
// Map of level IDs to chess scene IDs
const CHESS_LEVEL_SCENES: Record<string, keyof typeof CHESS_SCENES> = {
  'rook-first': 'ocean', // 'placeholder',
  'rook-enemies': 'ocean', // 'gumball',
  'rook-bishop-capture': 'ocean-bowl', // 'tight-wrap',
  'bishop-first': 'pringle',
  'knight-first': 'mountain-wrap',
  'queen-first': 'neon-pastel',
  'king-first': 'lava',
}
