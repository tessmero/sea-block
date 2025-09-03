/**
 * @file config-snapshot-helper.ts
 *
 * Help capture and compare snapshots of configs, used to track changes made
 * at runtime through debugging ui.
 */

import type { SeaBlock } from 'sea-block'
import type { CssStyle } from './style-parser'
import { STYLES } from 'gfx/styles/styles-list'
import type { ConfigItem, ConfigTree } from 'configs/config-tree'

export type Snapshot = {
  config: Record<string, string | number>
  style: CssStyle
  // center: { x: number, z: number }
}

export function saveSnapshot(seaBlock: SeaBlock): Snapshot {
  const config = JSON.parse(JSON.stringify(seaBlock.config.flatConfig))
  config.style = 'custom'

  const { x, z } = seaBlock.terrain.centerXZ
  config.offsetX = x / Math.pow(10, -0.6)
  config.offsetZ = z / Math.pow(10, -0.6)

  return {
    config,
    style: JSON.parse(JSON.stringify(STYLES.custom)),
    // center: seaBlock.terrain.centerXZ,
  }
}

export function restoreSnapshot(seaBlock: SeaBlock, snapshot: Snapshot) {
  // console.log('restore snapshot', JSON.stringify([...Object.keys(snapshot.config)]))

  // restore config values
  traverse(seaBlock.config.tree, (key, item) => {
    if (key in snapshot.config) {
      const value = snapshot.config[key]
      item.value = value
    }
  })
  // traverse(michaelConfig.tree, (key, item) => {
  //   if (key in snapshot.config) {
  //     const value = snapshot.config[key]
  //     item.value = value
  //   }
  // })

  STYLES.custom = snapshot.style

  // // restore camera target position in world
  // const { x, z } = snapshot.center
  // seaBlock.terrain.panToCenter(x - GRID_DETAIL, z - GRID_DETAIL)
}

type Visitor = (key: string, child: ConfigItem) => void

export function traverse(tree: ConfigTree, func: Visitor) {
  for (const key in tree.children) {
    const child = tree.children[key]
    if ('value' in child) {
      func(key, child) // visit leaf
    }
    else if ('children' in child) {
      traverse(child, func) // recurse
    }
  }
}

export function diffSnapshots(original: Snapshot, current: Snapshot) {
  const changedConfigValues = {}
  for (const key in current.config) {
    if (current.config[key] !== original.config[key]) {
      changedConfigValues[key] = current.config[key]
    }
  }
  const delta = {
    config: changedConfigValues,
    style: current.style,
    // center: current.center,
  } satisfies Snapshot
  // navigator.clipboard.writeText(
  //   JSON.stringify(delta, null, 2))
  return delta
}
