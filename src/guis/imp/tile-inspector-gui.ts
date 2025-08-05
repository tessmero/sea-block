/**
 * @file tile-inspector-gui.ts
 *
 * Gui for tile inspector.
 */

import type { ProcessedSubEvent } from 'mouse-touch-input'
import { Gui } from '../gui'
import type { TileIndex } from 'core/grid-logic/indexed-grid'

export class TileInspectorGui extends Gui {
  static {
    Gui.register('tile-inspector', {
      factory: () => new TileInspectorGui(),
      layoutFactory: () => ({}),
      elements: [],
    })
  }

  public pickedTile?: TileIndex

  public move(inputEvent: ProcessedSubEvent): boolean {
    const hasConsumed = super.move(inputEvent)

    this.pickedTile = undefined
    if (!hasConsumed) {
      this.pickedTile = inputEvent.pickedTileIndex
    }

    return hasConsumed
  }
}
