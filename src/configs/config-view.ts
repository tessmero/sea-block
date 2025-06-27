/**
 * @file config-view.ts
 *
 * Provides a flat, strong-typed view of a config tree.
 */

import { ConfigItem, ConfigTree, NumericParam } from './config-tree'

export class ConfigView<T extends ConfigTree> {
  public flatValues: LeafKeyValueMap<T>

  constructor(public readonly tree: T) {
    this.updateFlatValues()
  }

  updateFlatValues() {
    this.flatValues = flattenTree(this.tree) as LeafKeyValueMap<T>
  }
}

// helpers for types below
type ValueOfParam<T> =
  T extends NumericParam ? number : string
type UnionToIntersection<U> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// recursivley flatten bottom-level keys
type LeafKeys<T extends ConfigTree> =
  T extends { children: infer P }
    ? {
        [K in keyof P]:
        P[K] extends ConfigTree
          ? LeafKeys<P[K]>
          : K
      }[keyof P]
    : never

// map leaf keys to value type (string or number)
type LeafKeyMap<T> =
  T extends { children: infer P }
    ? {
        [K in keyof P & string]:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        P[K] extends { children: any }
          ? LeafKeyMap<P[K]>
          : { key: K, value: ValueOfParam<P[K]> }
      }[keyof P & string]
    : never

// map leaf keys to typed values
export type LeafKeyValueMap<T> =
  UnionToIntersection<
    LeafKeyMap<T> extends { key: infer K, value: infer V }
      ? { [P in K & string]: V }
      : never
  >

// used in ConfigView
function flattenTree<T extends ConfigTree>(
  tree: T,
  out: Record<string, string | number> = {},
): Record<LeafKeys<T>, string | number> {
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
  return out
}
