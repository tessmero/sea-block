/**
 * @file config-view.ts
 *
 * Provides a flat, strong-typed view of a config tree.
 */

import { ConfigItem, ConfigTree } from './config-tree'

export class ConfigView<T extends ConfigTree> {
  public flatValues: FlatConfigMap<T>

  constructor(public readonly tree: T) {
    this.updateFlatValues()
  }

  updateFlatValues() {
    this.flatValues = flattenTree(this.tree)
  }
}
// flat list of bottom-level keys
type AllLeafKeys<T extends ConfigTree> =
  T extends { children: infer P }
    ? { [K in keyof P]: P[K] extends ConfigTree ? AllLeafKeys<P[K]> : K }[keyof P]
    : never

// type for key K of tree T (string or number)
type LeafValueType<T extends ConfigTree, K extends string> =
  T extends { children: infer P }
    ? K extends keyof P
      ? P[K] extends { value: infer V }
        ? V
        : never
      : {
          [K2 in keyof P]: P[K2] extends ConfigTree
            ? LeafValueType<P[K2], K>
            : never
        }[keyof P]
    : never

// flat key -> value map
export type FlatConfigMap<T extends ConfigTree> = {
  [K in AllLeafKeys<T> & string]: LeafValueType<T, K>
}

// get flat view of a tree with type T
export function flattenTree<T extends ConfigTree>(
  tree: T,
  out: Record<string, string | number> = {},
): FlatConfigMap<T> {
  for (const [name, child] of Object.entries(tree.children)) {
    if ('action' in child) {
      // button, do nothing
    }
    else if ('value' in child) {
      out[name] = (child as ConfigItem).value
    }
    else {
      flattenTree(child as ConfigTree, out)
    }
  }
  return out as FlatConfigMap<T>
}
