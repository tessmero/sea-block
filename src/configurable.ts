/**
 * @file configurable.ts
 *
 * Base class for things that have an associated config tree.
 * Used for terrain generators, and physics simulations, and games.
 */
import { ConfigTree } from './configs/config-tree'
import { FlatConfigMap, flattenTree } from './configs/config-view'

export abstract class Configurable<T extends ConfigTree> {
  public abstract readonly config?: ConfigTree
  protected flatConfig: FlatConfigMap<T>

  public refreshConfig(): void {
    if (this.config) {
      this.flatConfig = flattenTree(this.config)
    }
  }
}
