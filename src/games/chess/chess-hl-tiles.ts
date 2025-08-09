/**
 * @file chess-hl-tiles.ts
 *
 * Chess highlighted tiles. Manages color-overrides
 * for terrain tiles used as chess board.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileGroup } from 'core/groups/tile-group'
import { getAllowedMoves } from './chess-rules'
import { pickColorsForChessTile } from './chess-colors'
import type { Chess } from './chess-helper'
import type { TileColors } from 'gfx/styles/style'

const _HIGHLIGHTS = [
  'hover', 'allowedMove',
] as const
export type ChessTileHighlight = (typeof _HIGHLIGHTS)[number]

export class ChessHlTiles {
  private readonly tileHighlights: Record<number, ChessTileHighlight> = {}
  private changed: Set<number> = new Set()
  public allowedMoves: Set<number> = new Set()

  public colorOverrides: Record<number, TileColors> = {}

  constructor(
    private readonly terrain: TileGroup,
  ) {}

  updateAllowedMoves(chess: Chess) {
    const {
      currentPhase: phase,
      centerTile: center,
      player: piece,
      boardTiles,
    } = chess
    const { terrain, allowedMoves, changed } = this

    // clear old highlights
    for (const i of allowedMoves) {
      changed.add(i)
    }
    allowedMoves.clear()

    if (phase === 'place-pawn') {
      // highlight bottom row
      const { x, z } = center
      for (let dx = -2; dx <= 2; dx++) {
        const tile = terrain.grid.xzToIndex(x + dx, z + 2)
        if (tile) {
          allowedMoves.add(tile.i)
          changed.add(tile.i)
        }
      }
    }
    else {
      // highlight allowed moves
      const targets = getAllowedMoves({ piece, terrain, boardTiles })
      for (const { i } of targets) {
        allowedMoves.add(i)
        changed.add(i)
      }
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
        this.setTempColorsForTile(colors, tile)
      }
      else {
        // start lerping to original colors
        this.restoreColorsForTile(tile)
      }
    }

    this.changed.clear()
  }

  public setTempColorsForTile(colors: TileColors, tile: TileIndex) {
    this.colorOverrides[tile.i] = colors
  }

  public restoreColorsForTile(tile: TileIndex) {
    delete this.colorOverrides[tile.i]
  }

  public restoreTileColors() {
    this.colorOverrides = {}
  }
}
