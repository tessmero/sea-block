/**
 * @file raft-config.ts
 *
 * Raft config implementation used to show buttons for debugging.
 */

import type { ConfigTree } from 'configs/config-tree'
import { Configurable } from 'configs/configurable'
import { raftToJson } from 'games/raft/blueprints/raft-io'
import type { RaftBlueprint } from 'games/raft/blueprints/raft.json'
import { resetRaftBuild } from 'games/raft/raft'
import type { SeaBlock } from 'sea-block'

const raftConfigTree = {
  children: {
    copyRaft: {
      label: 'Copy Raft',
      action: () => navigator.clipboard.writeText(
        JSON.stringify(raftToJson(), null, 2)),
      hasNoEffect: true,
    },
    pasteRaft: {
      label: 'Paste Raft',
      action: async (seablock: SeaBlock) => {
        const text = await navigator.clipboard.readText()
        const blueprint = JSON.parse(text) as RaftBlueprint
        resetRaftBuild(seablock, blueprint)
      },
    },
  },
} as const satisfies ConfigTree

// register Configurable
class RaftConfig extends Configurable<typeof raftConfigTree> {
  static { Configurable.register('raft', () => new RaftConfig()) }
  tree = raftConfigTree
}
export const raftConfig = Configurable.create('raft') as RaftConfig
