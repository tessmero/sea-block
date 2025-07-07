/**
 * @file configurable.ts
 *
 * Base class for things that have an associated config tree.
 * Used for terrain renderer, terrain generators, physics simulations, and games.
 *
 * In sea-block.ts we define the top-level configurable
 * who's tree contains other relevant trees.
 */
import type { ConfigTree } from './configs/config-tree'
import type { FlatConfigMap } from './configs/config-view'
import { flattenTree } from './configs/config-view'

export abstract class Configurable<T extends ConfigTree> {
  public abstract readonly config: ConfigTree
  public flatConfig: FlatConfigMap<T>

  public refreshConfig(): void {
    this.flatConfig = flattenTree(this.config)
  }
}
