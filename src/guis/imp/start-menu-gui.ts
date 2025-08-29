/**
 * @file start-menu-gui.ts
 *
 * Gui active after clicking launch on splash screen.
 */

import { smSequenceElems } from 'games/start-menu/sm-elements'
import { Gui } from 'guis/gui'
import { START_MENU_LAYOUT } from 'guis/layouts/start-menu-layout'

export class StartMenuGui extends Gui {
  static {
    Gui.register('start-menu', {
      factory: () => new StartMenuGui(),
      layoutFactory: () => (START_MENU_LAYOUT),
      elements: [
        ...smSequenceElems,
      ],
    })
  }
}
