/**
 * @file start-sequence-gui.ts
 *
 * Gui for start-sequence game, visible after clicking launch.
 */

import type { GuiElement } from 'guis/gui'
import { StartSequenceGame } from 'games/imp/start-sequence-game'
import { DropTransition } from 'gfx/3d/drop-transition'
import { Transition } from 'gfx/transition'
import { Gui } from 'guis/gui'
import { START_SEQUENCE_LAYOUT } from 'guis/layouts/start-sequence-layout'

const skipBtn: GuiElement = {
  display: { type: 'button', label: 'SKIP' },
  layoutKey: 'skip',
  hotkeys: ['Escape', 'Space'],
  clickAction: ({ seaBlock }) => {
    seaBlock.config.tree.children.game.value = 'free-cam'
    Transition.isFirstUncover = false
    DropTransition.t = 0
    seaBlock.startTransition()
    StartSequenceGame.wasSkipped = true
  },
}

export class StartSequenceGui extends Gui {
  static {
    Gui.register('start-sequence', {
      factory: () => new StartSequenceGui(),
      layoutFactory: () => (START_SEQUENCE_LAYOUT),
      elements: [
        skipBtn,
      ],
    })
  }
}
