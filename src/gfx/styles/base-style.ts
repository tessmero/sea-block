/**
 * @file base-style.ts
 *
 * Defines the base background/sky color and provides tile
 * colors directly from generated tiles.
 *
 * The terrain generator may also have a default css style
 * which is applied on top of these outputs using CssStyle.
 */

import { Color } from 'three'
import type { TileParams, TileStyle } from './style'
import { Style } from './style'

export class BaseStyle extends Style {
  background = new Color(0xaaccff)

  getTileStyle(params: TileParams): TileStyle {
    const color = params.generatedTile.color
    return {
      top: color.clone(),
      sides: color.clone(),
    }
  }
}
