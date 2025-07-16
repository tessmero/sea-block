/**
 * @file space-quest-tg.ts
 *
 * Terrain generator implementation adapted from space-quest.
 */
import { createNoise2D } from 'simplex-noise'
import { Color } from 'three'
import type { CssStyle } from '../util/style-parser'
import type { GeneratedTile } from './terrain-generator'
import { TerrainGenerator } from './terrain-generator'

const noise2D = createNoise2D()
const perlinScale = 2e-3
function getPerlin(px, py) {
  return noise2D(
    px * perlinScale,
    py * perlinScale,
  )
}

export class SpaceQuestTG extends TerrainGenerator {
  static { TerrainGenerator.register('space-quest', () => new SpaceQuestTG()) }

  label = 'space-quest'
  url = 'https://tessmero.github.io/space-quest'
  style: CssStyle = {
    'background': { value: '#000' },
    'sides@land': { lightness: -0.1 },
    'sides@sea': { lightness: '+0.1' },
    'top@sea': { saturation: '50%' },
  }

  public getTile(x: number, z: number): GeneratedTile {
    // check perlin value in center of tile
    const rawHeight = getPerlin(
      (x + 0.5) * 16,
      (z + 0.5) * 16,
    )

    // default is empty space / water
    let height = 132
    let isWater = true
    let colorData: ColorData = SPACE_COLORS

    if (rawHeight > 0.35) {
      colorData = WALL_COLORS
      height = 133 + (rawHeight - 0.35) * 100
      isWater = false
    }
    else if ((Math.abs(rawHeight) % 1e-6) < 2e-9) {
      colorData = PILLAR_COLORS
      height = 200 + (rawHeight) * 20
      isWater = true
    }
    else if (rawHeight > 0.1) {
      colorData = GROUND_COLORS
      height = 133 + (rawHeight - 0.1) * 10
      isWater = false
    }

    const sColor = pickColorForPixel(colorData, x, z)
    const color = sColor ? new Color(sColor) : new Color()
    return {
      height, color, isWater, isFlora: false,
    }
  }
}

function pickColorForPixel(data: ColorData, rawx: number, rawy: number) {
  const { scale, colors } = data
  const x = rawx
  const y = rawy
  const height = noise2D(x * scale, y * scale) // compute perlin with given scale

  const entries = Object.entries(colors)
  const n = entries.length
  for (let i = 0; i < n; i++) {
    const [color, criteria] = entries[i]
    const { from = -1, to: _to = 1, data: innerData } = criteria

    // check if 'to' should be inferred from next entry
    let to = _to
    if ((to === 1) && ((i + 1) < n)) {
      const [_nextCol, nextCrit] = entries[i + 1]
      if (typeof nextCrit.from === 'number') {
        to = nextCrit.from
      }
    }

    // test criteria
    if ((height >= from) && (height < to)) {
      if (innerData) {
        return pickColorForPixel(innerData, rawx, rawy)
      }
      return color
    }
  }
  return null
}

interface ColorData {
  scale: number
  colors: Record<string, CDRange>
}

interface CDRange {
  from?: number
  to?: number
  data?: ColorData
}

const SPACE_COLORS: ColorData = {
  scale: 0.01,
  colors: {

    // black
    '#080808': {
      from: -1,
    },

    // blackish
    '#101320': {
      from: -1,
    },

    // blueish
    '#11152A': {
      from: -0.25,
    },

    // purplish
    '#22162A': {
      from: 0.25,
    },
  },
}

const GROUND_COLORS: ColorData = {
  scale: 0.1,
  colors: {

    '#666': {
      from: -1,
    },

    '#777': {
      from: -0.25,
    },

    '#AAA': {
      from: 0.25,
      to: 1,
    },
  },
}

// purple
const PILLAR_COLORS: ColorData = {
  scale: 0.25657,
  colors: {

    '#7A1CAC': {
      from: -1,
    },

    '#AD49E1': {
      from: -0.25,
    },

    '#EBD3F8': {
      from: 0.25,
      to: 1,
    },
  },
}

// sandstone
const _WALL_A: ColorData = {
  scale: 0.05367,
  colors: {

    // red sand
    '#FF8A8A': {
      from: -1,
    },

    // green sand
    '#CCE0AC': {
      from: -0.25,
    },

    // tan sand
    '#F4DEB3': {
      from: 0.25,
      to: 1,
    },
  },
}

// plants
const _WALL_B: ColorData = {
  scale: 0.177245,
  colors: {

    // green blue
    '#006769': {
      from: -1,
    },

    // green
    '#40A578': {
      from: -0.25,
    },

    // lime
    '#E6FF94': {
      from: 0.25,
      to: 0.28,
    },

    // light green
    '#9DDE8B': {
      from: 0.28,
      to: 1,
    },
  },
}

// ice
const _WALL_C: ColorData = {
  scale: 0.08317,
  colors: {

    // periwinkle
    '#B1AFFF': {
      from: -1,
    },

    // blue pastel
    '#BBE9FF': {
      from: -0.25,
    },

    // yellow pastel
    '#FFFED3': {
      from: 0.25,
      to: 1,
    },
  },
}

// lava
const _WALL_D: ColorData = {
  scale: 0.177245,
  colors: {

    // maroon
    '#E4003A': {
      from: -1,
    },

    // purple
    '#B60071': {
      from: -0.25,
    },

    // yellow
    '#E6FF23': {
      from: 0.25,
      to: 0.28,
    },

    // red
    '#9D1111': {
      from: 0.28,
      to: 1,
    },
  },
}

const WALL_COLORS: ColorData = {
  scale: 4e-4,
  colors: {

    // lava
    _d: {
      from: -1,
      data: _WALL_D,
    },

    // sand
    _a: {
      from: -0.2,
      data: _WALL_A,
    },

    // life
    _b: {
      from: -0.1,
      data: _WALL_B,
    },

    // cold
    _c: {
      from: 0.1,
      data: _WALL_C,
    },
  },
}
