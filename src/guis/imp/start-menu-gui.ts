/**
 * @file start-menu-gui.ts
 *
 * Gui active after clicking launch on splash screen.
 */

import { toggleRadio } from 'audio/song-playlist'
import type { GuiElement } from 'guis/gui'
import { Gui } from 'guis/gui'
import type { SmLayoutKey } from 'guis/keys/sm-layout-keys'
import { START_MENU_LAYOUT } from 'guis/layouts/start-menu-layout'

type SmElem = GuiElement<SmLayoutKey>

const smBanner: SmElem = {
  layoutKey: 'smBanner',
  display: {
    type: 'label',
    icon: 'sm-banner.png',
  },
}

const smStartBtn: SmElem = {
  layoutKey: 'smStartBtn',
  display: {
    type: 'button',
    border: '16x16-btn-sm',
    label: 'START',
    font: 'mini',
    color: 'white',
    shouldClearBehind: true,
  },
  clickAction: ({ seaBlock }) => {
    seaBlock.config.tree.children.game.value = 'free-cam'
    seaBlock.startTransition({
      callback: () => toggleRadio(), // playNextTrack(FREECAM_PLAYLIST),
    })
  },
}

const smSettingsBtn: SmElem = {
  layoutKey: 'smSettingsBtn',
  display: {
    type: 'button',
    border: '16x16-btn-sm',
    label: 'SETTINGS',
    font: 'mini',
    color: 'white',
    shouldClearBehind: true,
  },
  clickAction: ({ seaBlock }) => {
    seaBlock.isShowingSettingsMenu = true
    seaBlock.onResize()
  },
}

// lists of segemnt-specific elemements
export const smSequenceElems: Array<Array<SmElem>> = [
  // nothing
  [],
  // flashing light warning
  [{
    layoutKey: 'smBanner',
    display: {
      type: 'label',
      label: 'flashing lights',
      color: 'white',
    },
  }],

  // story
  [{
    layoutKey: 'smBanner',
    display: {
      type: 'label',
      label: 'story',
      color: 'white',
    },
  }],

  // nothing (start music)
  [],

  // main menu
  [
    smBanner,
    smStartBtn,
    smSettingsBtn,
  ],
]

export class StartMenuGui extends Gui {
  static {
    Gui.register('start-menu', {
      factory: () => new StartMenuGui(),
      layoutFactory: () => (START_MENU_LAYOUT),
      elements: [
        ...smSequenceElems.flatMap(e => e),
      ],
    })
  }
}
