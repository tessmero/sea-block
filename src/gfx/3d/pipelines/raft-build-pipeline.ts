/**
 * @file raft-build-pipeline.ts
 *
 * Pipeline for raft builder mode.
 */

import type { Pipeline } from './pipeline'
import { raft } from 'games/raft/raft'
import { RaftHlTiles } from 'games/raft/raft-hl-tiles'
import { freeCamPipeline } from './free-cam-pipeline'
import { restoreTileColors } from '../tile-group-color-buffer'

export const raftBuildPipeline = {
  update: () => {},
  steps: [

    // 0. inherit freecam pipeline
    ...freeCamPipeline.steps,

    // 1. If build-able or hovered replace colors.
    ({ current, tileIndex }) => {
      const { buildable, hovered } = raft.hlTiles
      const { i } = tileIndex

      if (buildable.has(i)) {
        current.targetColors = RaftHlTiles.pickColorsForTile('buildable')
      }
      else if (hovered && hovered.i === tileIndex.i) {
        current.targetColors = RaftHlTiles.pickColorsForTile('hover')
      }
      else {
        restoreTileColors(tileIndex)
      }

      return current
    },
  ],

} as const satisfies Pipeline
