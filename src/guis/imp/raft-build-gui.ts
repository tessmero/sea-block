/**
 * @file raft-build-gui.ts
 *
 * Raft-build gui implementation that points to modules in src/games/raft.
 */

import { raft } from 'games/raft/raft'
import { RAFT_BUILD_GUI_ELEMENTS } from 'games/raft/raft-build-gui-elements'
import { Gui } from 'guis/gui'
import { RAFT_BUILD_LAYOUT } from 'guis/layouts/raft-build-layout'
import type { ProcessedSubEvent } from 'mouse-touch-input'

export class RaftBuildGui extends Gui {
  static {
    Gui.register('raft-build', {
      factory: () => new RaftBuildGui(),
      layoutFactory: () => RAFT_BUILD_LAYOUT,
      elements: [
        ...RAFT_BUILD_GUI_ELEMENTS,
      ],
    })
  }

  public move(inputEvent: ProcessedSubEvent): boolean {
    const hasConsumed = super.move(inputEvent)
    if (!hasConsumed) {
      // passed through flat gui
      return raft.hoverWorld(inputEvent)
    }
    return hasConsumed
  }

  public click(inputEvent: ProcessedSubEvent): boolean {
    const hasConsumed = super.click(inputEvent)
    if (!hasConsumed) {
      // passed through flat gui
      return raft.clickWorld(inputEvent)
    }
    return hasConsumed
  }
}
