/**
 * @file chess-tg.ts
 *
 * Chess world terrain generator.
 */

import type { GeneratedTile } from './terrain-generator'
import { TerrainGenerator } from './terrain-generator'
import { MichaelTG } from './michael-tg'
import { GRID_DETAIL } from 'settings'

export type ChessTGMods = {
  isLandFlora?: boolean
  isAllLand?: boolean
  isAllOcean?: boolean

  isUnwarped?: boolean
  isBowl?: boolean
  isSaddle?: boolean
}

export class ChessTG extends MichaelTG {
  static { TerrainGenerator.register('chess', () => new ChessTG()) }

  static currentMods: ChessTGMods = {}

  label = 'chess'
  //   style: CssStyle = {
  //     'background': { value: '#cccccc' },
  //     'top': { saturation: '10%' },
  //     'sides': { saturation: '10%' },
  //     'sides@land': { lightness: -0.1 },
  //     'sides@sea': { lightness: '+0.1' },
  //     'top@sea': { saturation: '50%' },
  //   }

  public getTile(rawX: number, rawZ: number): GeneratedTile {
    let result = super.getTile(rawX, rawZ)

    // apply modifiactions defined in chess-scenery

    if (ChessTG.currentMods.isAllOcean) {
      const x = rawX / this.xzScale
      const z = rawZ / this.xzScale
      const elevation = this.getHeight(x, z)
      const color = this.waterColorLookup(132 - elevation)

      result.isWater = true
      result.height = 132
      result.color = color
    }

    if (ChessTG.currentMods.isAllLand) {
      result.isWater = false
    }

    const offset = sphereOffset(rawX - GRID_DETAIL / 2, rawZ - GRID_DETAIL / 2)
    result = {
      ...result,
      height: result.height + offset,
    }

    if (ChessTG.currentMods.isLandFlora) {
      result.isFlora = !result.isWater
    }

    return result
  }
}

function sphereOffset(x: number, z: number): number {
  if (ChessTG.currentMods.isUnwarped) {
    return 0
  }

  const maxOffset = -30
  const atRadius = 12
  const dist = Math.sqrt(x * x + z * z)
  const rawOffset = maxOffset * Math.pow(Math.min(1, dist / atRadius), 4)

  let mul = 1
  if (ChessTG.currentMods.isBowl) {
    mul = -1
  }
  if (ChessTG.currentMods.isSaddle) {
    mul = Math.sin(Math.atan2(x, z) * 2)
  }

  return rawOffset * mul
}
