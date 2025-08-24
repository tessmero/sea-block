/**
 * @file raft-drive-gui.ts
 *
 * Gui implementation for raft driving game, passes hover-click event to modules in
 * src/games/raft to interact with moving raft and its tile grid.
 */

import { raftDriveLayoutFactory } from 'games/raft/raft-drive-helper'
import { clickRaftWorld, hoverRaftWorld } from 'games/raft/raft-mouse-input-helper'
import { leftJoy, leftJoySlider, rightJoy, rightJoySlider } from 'guis/elements/joysticks'
import { wasdButtons } from 'guis/elements/wasd-buttons'
import { Gui } from 'guis/gui'
import { FREECAM_DESKTOP_LAYOUT } from 'guis/layouts/freecam-desktop-layout'
import { FREECAM_LANDSCAPE_LAYOUT } from 'guis/layouts/freecam-landscape-layout'
import { FREECAM_PORTRAIT_LAYOUT } from 'guis/layouts/freecam-portrait-layout'
import { RAFT_DRIVE_FOCUS_DESKTOP_LAYOUT } from 'guis/layouts/raft-drive-focus-desktop-layout'
import { RAFT_DRIVE_FOCUS_TOUCH_LAYOUT } from 'guis/layouts/raft-drive-focus-touch-layout'
import type { ProcessedSubEvent } from 'mouse-touch-input'

export class RaftDriveGui extends Gui {
  static {
    Gui.register('raft-drive', {
      factory: () => new RaftDriveGui(),
      layoutFactory: raftDriveLayoutFactory,
      allLayouts: [
        RAFT_DRIVE_FOCUS_TOUCH_LAYOUT,
        RAFT_DRIVE_FOCUS_DESKTOP_LAYOUT,
        FREECAM_DESKTOP_LAYOUT,
        FREECAM_LANDSCAPE_LAYOUT,
        FREECAM_PORTRAIT_LAYOUT,
      ],
      elements: [
        leftJoy, leftJoySlider,
        rightJoy, rightJoySlider,
        ...wasdButtons,
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
