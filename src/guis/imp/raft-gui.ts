/**
 * @file raft-gui.ts
 *
 * Gui implementation for raft driving game, passes hover-click event to modules in
 * src/games/raft to interact with moving raft and its tile grid.
 */

import { raftPhaseDialogElements } from 'games/raft/gui/raft-phase-dialog'
import { raftPieceDialogElements } from 'games/raft/gui/raft-piece-dialog'
import { raftSettingsBtn, raftToolbarElements } from 'games/raft/gui/raft-toolbar-elements'
import { raftLayoutFactory } from 'games/raft/raft-drive-helper'
import { clickRaftWorld, hoverRaftWorld } from 'games/raft/raft-mouse-input-helper'
import { leftJoy, leftJoySlider, rightJoy, rightJoySlider } from 'guis/elements/joysticks'
import { wasdButtons } from 'guis/elements/wasd-buttons'
import { Gui } from 'guis/gui'
import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import { RAFT_DESKTOP_LAYOUT } from 'guis/layouts/raft/raft-desktop-layout'
import { RAFT_LANDSCAPE_LAYOUT } from 'guis/layouts/raft/raft-landscape-layout'
import { RAFT_PORTRAIT_LAYOUT } from 'guis/layouts/raft/raft-portrait-layout'
import type { ProcessedSubEvent } from 'mouse-touch-input'

export class RaftGui extends Gui<RaftLayoutKey> {
  static {
    Gui.register('raft', {
      factory: () => new RaftGui(),
      layoutFactory: raftLayoutFactory,
      allLayouts: [
        RAFT_DESKTOP_LAYOUT,
        RAFT_LANDSCAPE_LAYOUT,
        RAFT_PORTRAIT_LAYOUT,
      ],
      elements: [
        leftJoy, leftJoySlider,
        rightJoy, rightJoySlider,
        ...wasdButtons,
        ...raftToolbarElements, raftSettingsBtn,
        ...raftPhaseDialogElements,
        ...raftPieceDialogElements,
      ],
    })
  }

  public click(event: ProcessedSubEvent): boolean {
    // console.log('raft-drive-gui click')
    let hasConsumed = super.click(event)
    if (!hasConsumed) {
      hasConsumed = clickRaftWorld(event)
    }
    else {
      // console.log('raft-drive-gui click consumed by standard element')
    }
    return hasConsumed
  }

  public move(inputEvent: ProcessedSubEvent): boolean {
    const hasConsumed = super.move(inputEvent)
    if (!hasConsumed) {
      // hover on 2d or 3d chess board
      hoverRaftWorld(inputEvent)
    }
    return hasConsumed
  }
}
