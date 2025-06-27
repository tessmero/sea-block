/**
 * @file all-ocean-tg.ts
 *
 * All-water terrain generator implementation.
 * We use MichaelTG for coloring ocean tiles.
 */

import { MichaelTG } from './michael-tg'
import { GeneratedTile } from './terrain-generator'

export class AllOceanTG extends MichaelTG {
  public getTile(x: number, z: number): GeneratedTile {
    const elevation = this.getHeight(x, z)
    const color = this.waterColorLookup(132 - elevation)
    return {
      height: 132,
      color,
      isWater: true,
    }
  }
}
