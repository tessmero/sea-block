/**
 * @file all-ocean-tg.ts
 *
 * All-water terrain generator implementation.
 * We use MichaelTG for coloring ocean tiles.
 */

import { MichaelTG } from './michael-tg'
import { TerrainGenerator, type GeneratedTile } from './terrain-generator'

export class AllOceanTG extends MichaelTG {
  static { TerrainGenerator.register('all-ocean', () => new AllOceanTG()) }

  public getTile(rawX: number, rawZ: number): GeneratedTile {
    const x = rawX / this.xzScale
    const z = rawZ / this.xzScale
    const elevation = this.getHeight(x, z)
    const color = this.waterColorLookup(132 - elevation)
    return {
      height: 132,
      color,
      isWater: true,
    }
  }
}
