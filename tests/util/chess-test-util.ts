/**
 * @file chess-test-util.ts
 *
 * Helper to build mock chess context.
 */

import { Vector3 } from 'three'
import { TileIndex } from '../../src/core/grid-logic/indexed-grid'
import { TiledGrid } from '../../src/core/grid-logic/tiled-grid'
import { Tiling } from '../../src/core/grid-logic/tilings/tiling'
import { TileGroup } from '../../src/core/groups/tile-group'
import { Chess } from '../../src/games/chess/chess-helper'
import { chessBoardPipeline } from '../../src/gfx/3d/pipelines/chess-board-pipeline'
import { TileValues } from '../../src/gfx/3d/pipelines/pipeline'
import { setOriginalTileColors } from '../../src/gfx/3d/tile-group-color-buffer'
import { RenderableTile } from '../../src/gfx/3d/tile-group-gfx-helper'
import { StyleParser } from '../../src/util/style-parser'
import { RenderablePiece } from '../../src/games/chess/gfx/chess-3d-gfx-helper'
import { SeaBlock } from '../../src/sea-block'
import { ChessHlTiles } from '../../src/games/chess/chess-hl-tiles'
import { freeCamPipeline } from '../../src/gfx/3d/pipelines/free-cam-pipeline'
import { equal } from 'assert'
import { TilingName } from '../../src/imp-names'

export async function mockChess(width, depth, tiling: TilingName) {
  // remove freecam pipeline steps from beginning of chess pipeline
  for (const step of freeCamPipeline.steps) {
    const i = chessBoardPipeline.steps.indexOf(step)
    equal(i, 0, `chess pipeline should inherit freecam pipeline`)
    chessBoardPipeline.steps.splice(0, 1)
  }

  // mock chess
  const grid = new TiledGrid(width, depth, Tiling.create(tiling))
  const terrain = {
    grid,
    generatedTiles: [] as Array<RenderableTile | null>,
  } as TileGroup
  const centerTile = grid.xzToIndex(2, 2) as TileIndex
  const positionDummy = new Vector3()
  function getPosOnTile(tile: TileIndex, target?: Vector3) {
    const { x, z } = grid.indexToPosition(tile)
    const height = 12
    const writeTo = target || positionDummy
    writeTo.set(x, height, z)
    return writeTo
  }
  const player = {
    tile: centerTile, type: 'rook',
    mesh: { position: getPosOnTile(centerTile) },
  } as RenderablePiece
  function getPieceOnTile(tile: TileIndex): RenderablePiece | undefined {
    if (tile === centerTile) {
      return player
    }
  }
  const chess = {
    context: {
      terrain,
    } as SeaBlock,
    boardTiles: grid.tileIndices.map(({ i }) => i),
    hlTiles: new ChessHlTiles(),
    getPosOnTile,
    getPieceOnTile,
    centerTile,
    goalTile: grid.tileIndices[centerTile.i + 1],
    player,
    pawns: [] as ReadonlyArray<RenderablePiece>,
    enemies: [] as ReadonlyArray<RenderablePiece>,
  } as Chess

  populateTileColors(chess)
  return chess
}

export function populateTileColors(chess: Chess) {
  const { terrain } = chess.context
  const { grid } = terrain
  // populate tile color buffers
  for (const tileIndex of grid.tileIndices) {
    let current: TileValues = { height: 0, yOffset: 0 }
    chess.hlTiles.updateAllowedMoves(chess)
    chessBoardPipeline.setChess(chess)

    for (const step of chessBoardPipeline.steps) {
      const result = step({ group: terrain, current, tileIndex, style: new StyleParser({}) })
      if (!result) {
        return true
      }
      current = result
    }
    const { targetColors } = current // result of pipeline
    if (targetColors) {
      setOriginalTileColors(tileIndex, targetColors, true)
    }
    // setOriginalTileColors(tile, pickColorsForChessTile(tile), true)
  }
}
