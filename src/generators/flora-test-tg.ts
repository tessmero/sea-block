/**
 * @file flora-test-tg.ts
 *
 * Same as MichaelTG, but all land tiles have flora.
 */

import { MichaelTG } from './michael-tg'
import { TerrainGenerator, type GeneratedTile } from './terrain-generator'

export class FloraTestTG extends MichaelTG {
  static { TerrainGenerator.register('flora-test', () => new FloraTestTG()) }

  public getTile(rawX: number, rawZ: number): GeneratedTile {
    const result = super.getTile(rawX, rawZ)
    return {
      ...result,
      isFlora: !result.isWater,

      // // all flat with flora
      // isWater: false,
      // isFlora: true,
      // height: 140,
    }
  }
}
