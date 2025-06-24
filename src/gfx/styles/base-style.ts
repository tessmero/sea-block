/**
 * @file base-style.ts
 *
 * Defines the base background/sky color and provides tile
 * colors directly from the terrain generator.
 */

import { Color } from 'three'
import { Style, TileStyle } from './style'

export class BaseStyle extends Style {
  background = new Color(0xaaccff)

  getTileStyle(params): TileStyle {
    const tgColor = params.terrainGenerator.getTileColor(params.x, params.z)
    const [r, g, b] = tgColor.map(v => v / 255)
    return {
      top: new Color(r, g, b),
      sides: new Color(r, g, b),
    }
  }
}
