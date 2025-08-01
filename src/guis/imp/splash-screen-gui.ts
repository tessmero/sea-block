/**
 * @file splash-screen-gui.ts
 *
 * Gui for splash-screen game, visible on page load.
 */

import type { GuiElement } from 'guis/gui'
import { Gui } from 'guis/gui'
import { SPLASH_SCREEN_LAYOUT } from 'guis/layouts/splash-screen-layout'

const elements: Array<GuiElement> = [
  {
    display: { type: 'button', label: 'LAUNCH' },
    layoutKey: 'launch',
    hotkeys: ['Space'],
    isSticky: true,
    clickAction: ({ seaBlock }) => {
      seaBlock.startTransition()
    },
  },
]

export class SplashScreenGui extends Gui {
  static {
    Gui.register('splash-screen', {
      factory: () => new SplashScreenGui(),
      elements,
      layoutFactory: () => (SPLASH_SCREEN_LAYOUT),
    })
  }
}
