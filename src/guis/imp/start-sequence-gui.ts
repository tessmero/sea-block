/**
 * @file start-sequence-gui.ts
 *
 * Gui for start-sequence game, visible after clicking launch.
 */

import type { GuiElement } from 'guis/gui'
import { StartSequenceGame } from 'games/imp/start-sequence-game'
import { Gui } from 'guis/gui'
import { START_SEQUENCE_LAYOUT } from 'guis/layouts/start-sequence-layout'
import { Transition } from 'gfx/transitions/transition'
import { DropTransition } from 'gfx/transitions/imp/drop-transition'

const skipBtn: GuiElement = {
  display: { type: 'button', label: 'SKIP' },
  layoutKey: 'skip',
  hotkeys: ['Escape', 'Space'],
  clickAction: ({ seaBlock }) => {
    seaBlock.config.tree.children.game.value = 'free-cam'
    Transition.isFirstUncover = false
    DropTransition.t = 0
    seaBlock.startTransition({
      transition: Transition.create('flat', seaBlock),
    })
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
