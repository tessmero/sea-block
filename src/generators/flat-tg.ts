/**
 * @file flat-tg.ts
 *
 * Flat ground terrain for testing.
 */

import { Color } from 'three'
import { TerrainGenerator, type GeneratedTile } from './terrain-generator'
import { MichaelTG } from './michael-tg'

const colorA = new Color(0xcccccc)
const colorB = new Color(0x555555)

export class FlatTG extends MichaelTG {
  static { TerrainGenerator.register('flat', () => new FlatTG()) }

  public getTile(x: number, z: number): GeneratedTile {
    return {
      height: 132,
      color: ((Math.abs(x) + Math.abs(z)) % 2) === 0 ? colorA : colorB,
      isWater: false, isFlora: false,
    }
  }
}
