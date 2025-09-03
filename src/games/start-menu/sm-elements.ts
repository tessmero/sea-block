/**
 * @file sm-elements.ts
 *
 * Start menu gui elements (included in start-menu-gui.ts).
 */

import type { GuiElement } from 'guis/gui'
import type { SmLayoutKey } from 'guis/keys/sm-layout-keys'
import { smIvy } from './sm-ivy/sm-ivy'
import { FREECAM_PLAYLIST, playNextTrack } from 'audio/song-player'
import { Transition } from 'gfx/transitions/transition'
import { playSound } from 'audio/sound-effect-player'

type SmElem = GuiElement<SmLayoutKey>

export const smBanner: SmElem = {
  layoutKey: 'smBanner',
  display: {
    type: 'label',
    icon: 'sm-banner-edge.png',
  },
}

export const smStartBtn: SmElem = {
  layoutKey: 'smStartBtn',
  gamepadNavBox: 'smStartBtn',
  hotkeys: ['Space', 'ButtonStart'],
  display: {
    type: 'button',
    border: '16x16-btn-sm',
    label: 'START',
    font: 'mini',
    color: 'white',
    shouldClearBehind: true,
    gamepadPrompt: {
      offset: [0, 16],
    },
  },
  clickAction: ({ seaBlock }) => {
    playSound('smStart')
    Transition.isFirstUncover = true
    seaBlock.config.tree.children.game.value = 'free-cam'
    seaBlock.startTransition({
      callback: () => {
        playNextTrack(FREECAM_PLAYLIST)
        smIvy.canvas.style.display = 'none' // remove ivy animation canvas
      },
    })
  },
}

export const smSettingsBtn: SmElem = {
  layoutKey: 'smSettingsBtn',
  gamepadNavBox: 'smSettingsBtn',
  display: {
    type: 'button',
    border: '16x16-btn-sm',
    label: 'SETTINGS',
    font: 'mini',
    color: 'white',
    shouldClearBehind: true,
    gamepadPrompt: {
      offset: [0, 16],
    },
  },
  clickAction: ({ seaBlock }) => {
    seaBlock.toggleSettings()
    if (seaBlock.isShowingSettingsMenu) {
      for (const { display } of smSequenceElems) {
        display.isVisible = false
        display.needsUpdate = true
      }
    }
    // seaBlock.onResize()
  },
}

export const smWarning: SmElem = {
  layoutKey: 'smText',
  display: {
    type: 'label',
    label: '    warning\n\nflashing lights',
    color: 'white',
  },
}

// export const smStory: SmElem = {
//   layoutKey: 'smText',
//   display: {
//     type: 'label',
//     label: 'warning:\nflashing lights',
//     color: 'white',
//   },
// }

export const smSequenceElems = [
  smBanner,
  smStartBtn,
  smSettingsBtn,
  smWarning,
  // smStory,
]
