/**
 * @file chess-hl-tiles.ts
 *
 * Chess highlighted tiles. Manages color-overrides
 * for terrain tiles used as chess board.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileGroup } from 'core/groups/tile-group'
import type { PieceName } from './chess-enums'
import { getAllowedMoves } from './chess-rules'
import { pickColorsForChessTile } from './chess-colors'

const _HIGHLIGHTS = [
  'hover', 'allowedMove',
] as const
export type ChessTileHighlight = (typeof _HIGHLIGHTS)[number]

export class ChessHlTiles {
  private readonly tileHighlights: Record<number, ChessTileHighlight> = {}
  private changed: Set<number> = new Set()
  public allowedMoves: Set<number> = new Set()

  constructor(
    private readonly terrain: TileGroup,
  ) {}

  updateAllowedMoves(tile: TileIndex, piece: PieceName) {
    const { terrain, allowedMoves, changed } = this

    // clear old highlights
    for (const i of allowedMoves) {
      changed.add(i)
    }
    allowedMoves.clear()

    // highlight new allowed moves
    const targets = getAllowedMoves({ piece, tile, terrain })
    for (const { i } of targets) {
      allowedMoves.add(i)
      changed.add(i)
    }
  }

  set(tile: TileIndex, hl: ChessTileHighlight) {
    const { i } = tile
    if (this.tileHighlights[i] !== hl) {
      this.tileHighlights[i] = hl
      this.changed.add(i)
    }
  }

  clear(tile: TileIndex | number) {
    const i = (typeof tile === 'number') ? tile : tile.i
    if (i in this.tileHighlights) {
      delete this.tileHighlights[i]
      this.changed.add(i)
    }
  }

  private pickHlToDisplay(i: number): ChessTileHighlight | undefined {
    if (i in this.tileHighlights) {
      return this.tileHighlights[i]
    }
    if (this.allowedMoves.has(i)) {
      return 'allowedMove'
    }
  }

  update() {
    const { terrain } = this
    const { grid, gfxHelper } = terrain
    const { tileIndices } = grid

    for (const i of this.changed) {
      const tile = tileIndices[i]
      const hl = this.pickHlToDisplay(i)
      if (hl) {
        const colors = pickColorsForChessTile(tile, hl)

        // start lerping to highlight colors
        gfxHelper.setTempColorsForTile(colors, tile)
      }
      else {
        // start lerping to original colors
        gfxHelper.restoreColorsForTile(tile)
      }
    }

    this.changed.clear()
  }
}
