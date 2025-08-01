/**
 * @file empty-gui.ts
 *
 * Placeholder used for games with no gui elements.
 */

import { Gui } from 'guis/gui'

export class EmptyGui extends Gui {
  static {
    Gui.register('empty', {
      factory: () => new EmptyGui(),
      layoutFactory: () => ({}),
      elements: [],
    })
  }
}
