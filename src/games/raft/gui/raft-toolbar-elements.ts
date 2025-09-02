/**
 * @file raft-toolbar-elements.ts
 *
 * Gui elements always on screen in raft game
 * (though they may be covered by a dialog).
 */

import type { GuiElement } from 'guis/gui'
import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import { raft } from '../raft'
import type { ImageAssetUrl } from 'gfx/2d/image-asset-urls'
import { type RaftPhase } from '../raft-enums'

type RaftElem = GuiElement<RaftLayoutKey>

export const RAFT_TOOLBAR_PHASES: Array<RaftPhase> = [
  'place-floor',
  'place-button', 'place-thruster', 'show-all-wires',
]

export const RAFT_TOOLBAR_BUTTONS = [
  'placeFloorBtn',
  'placeButtonBtn', 'placeThrusterBtn', 'wiresBtn',
] as const satisfies ReadonlyArray<RaftLayoutKey>

type ButtonName = (typeof RAFT_TOOLBAR_BUTTONS)[number]

const actions: Record<ButtonName, () => void> = {
  placeFloorBtn: () => {
    if (raft.currentPhase === 'place-floor') {
      raft.startPhase('idle')
    }
    else {
      setRaftToolbarPressed('placeFloorBtn')
      raft.startPhase(`place-floor`)
      raft.hlTiles.updateBuildableTiles('floor')
    }
  },
  placeButtonBtn: () => {
    if (raft.currentPhase === `place-button`) {
      raft.startPhase('idle')
    }
    else {
      setRaftToolbarPressed('placeButtonBtn')
      raft.startPhase(`place-button`)
      raft.hlTiles.updateBuildableTiles('button')
    }
  },
  placeThrusterBtn: () => {
    if (raft.currentPhase === `place-thruster`) {
      raft.startPhase('idle')
    }
    else {
      setRaftToolbarPressed('placeThrusterBtn')
      raft.startPhase(`place-thruster`)
      raft.hlTiles.updateBuildableTiles('thruster')
    }
  },
  wiresBtn: () => {
    if (raft.currentPhase === 'show-all-wires') {
      raft.startPhase('idle')
    }
    else {
      setRaftToolbarPressed('wiresBtn')
      raft.startPhase('show-all-wires')
      raft.hlTiles.clear()
    }
  },
}

// const userFriendlyLabels: Record<(typeof RAFT_TOOLBAR_BUTTONS)[number], string> = {
//   placeFloorBtn: 'Floor',
//   placeButtonBtn: 'Button',
//   placeThrusterBtn: 'Thruster',
//   wiresBtn: 'Wires',
// }
const toolbarIcons: Record<(typeof RAFT_TOOLBAR_BUTTONS)[number], ImageAssetUrl> = {
  placeFloorBtn: 'icons/16x16-checkered.png',
  placeButtonBtn: 'icons/raft/16x16-raft-button.png',
  placeThrusterBtn: 'icons/raft/16x16-thruster.png',
  wiresBtn: 'icons/raft/16x16-wire.png',
}

export const raftToolbarElements: Array<RaftElem>
  = RAFT_TOOLBAR_BUTTONS.map(layoutKey => ({
    layoutKey,
    display: {
      type: 'button',
      icon: toolbarIcons[layoutKey],
      // label: userFriendlyLabels[layoutKey],
    },
    clickAction: () => {
      actions[layoutKey]() // button-specific action
    },
  }))

export function setRaftToolbarPressed(pressedBtn?: ButtonName) {
  for (const [i, name] of RAFT_TOOLBAR_BUTTONS.entries()) {
    const { display } = raftToolbarElements[i]
    display.forcedState = (name === pressedBtn) ? 'pressed' : undefined
    display.needsUpdate = true
  }
}

export const prevToolBtn: RaftElem = {
  layoutKey: 'prevToolBtn',
  hotkeys: ['ButtonLB'],
  display: {
    type: 'button',
    label: '<',
  },
  clickAction: () => {
    cycleTool(-1)
  },
}
export const nextToolBtn: RaftElem = {
  layoutKey: 'nextToolBtn',
  hotkeys: ['ButtonRB'],
  display: {
    type: 'button',
    label: '>',
  },
  clickAction: () => {
    cycleTool(1)
  },
}

export const raftSettingsBtn: RaftElem = {
  layoutKey: 'raftSettingsBtn',
  hotkeys: ['Escape', 'ButtonStart'],
  display: {
    type: 'button',
    icon: 'icons/16x16-config.png',
    isVisible: true,
  },
  clickAction: ({ seaBlock }) => {
    seaBlock.toggleSettings()

    // playSound('click')
    // // switch to free-cam game
    // seaBlock.startTransition({
    //   callback: () => {
    //     ChessScenery.restoreOriginalSnapshot(seaBlock)
    //     playNextTrack(FREECAM_PLAYLIST)
    //   },
    // })
  },
}

function cycleTool(delta: -1 | 1) {
  const i = RAFT_TOOLBAR_PHASES.indexOf(raft.currentPhase)
  const n = RAFT_TOOLBAR_BUTTONS.length
  const buttonName = RAFT_TOOLBAR_BUTTONS[(i + delta + n) % n]
  actions[buttonName]()
}
