/**
 * @file raft-building-rules.ts
 *
 * Rules for determining where new pieces can be built,
 * given previously-built raft pieces.
 */

import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { PieceName, PlaceablePieceName } from './raft-enums'
import { raft } from './raft'

export function isBuildable(piece: PieceName, tile: TileIndex) {
  const { grid } = raft

  // get params
  const params: Params = {
    current: raft.getPiecesOnTile(tile).map(({ type }) => type),
    adjacentFloors: 0,
  }
  for (const { x, z } of grid.tiling.getAdjacent(tile.x, tile.z)) {
    const adjTile = grid.xzToIndex(tile.x + x, tile.z + z)
    if (adjTile && raft.getPiecesOnTile(adjTile).some(p => p.type === 'floor')) {
      params.adjacentFloors++
    }
  }

  // apply rules for piece
  return rules[piece](params)
}

type Params = {
  current: Array<PieceName | undefined> // pieces on tile in question
  adjacentFloors: number // number of adjacent tiles with floor
}

const rules: Record<PlaceablePieceName, (params: Params) => boolean> = {

  // floor is built on empty tile
  floor: ({ current }) => current.length === 0,

  // button is built on floor
  button: ({ current }) => current.length === 1 && current[0] === 'floor',

  // thruster on empty tile with exactly one adjacent floor
  thruster: ({ current, adjacentFloors }) => current.length === 0 && adjacentFloors === 1,
}
