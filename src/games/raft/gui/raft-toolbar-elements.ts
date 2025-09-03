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

export const RAFT_TOOLBAR_BUTTONS = [
  'placeFloorBtn',
  'placeButtonBtn',
  'placeThrusterBtn',
  'wiresBtn',
] as const satisfies ReadonlyArray<RaftLayoutKey>
type ToolName = (typeof RAFT_TOOLBAR_BUTTONS)[number]

type ToolButton = {
  phase: RaftPhase
  icon: ImageAssetUrl
  action: () => void
}

const allToolButtons: Record<ToolName, ToolButton> = {
  placeFloorBtn: {
    phase: 'place-floor',
    icon: 'icons/16x16-checkered.png',
    action: () => {
      if (raft.currentPhase === 'place-floor') {
        raft.startPhase('idle')
      }
      else {
        setRaftToolbarPressed('placeFloorBtn')
        raft.startPhase(`place-floor`)
        raft.hlTiles.updateBuildableTiles('floor')
      }
    },
  },
  placeButtonBtn: {
    phase: 'place-button',
    icon: 'icons/raft/16x16-raft-button.png',
    action: () => {
      if (raft.currentPhase === `place-button`) {
        raft.startPhase('idle')
      }
      else {
        setRaftToolbarPressed('placeButtonBtn')
        raft.startPhase(`place-button`)
        raft.hlTiles.updateBuildableTiles('button')
      }
    },
  },

  placeThrusterBtn: {
    phase: 'place-thruster',
    icon: 'icons/raft/16x16-thruster.png',
    action: () => {
      if (raft.currentPhase === `place-thruster`) {
        raft.startPhase('idle')
      }
      else {
        setRaftToolbarPressed('placeThrusterBtn')
        raft.startPhase(`place-thruster`)
        raft.hlTiles.updateBuildableTiles('thruster')
      }
    },
  },

  wiresBtn: {
    phase: 'show-all-wires',
    icon: 'icons/raft/16x16-wire.png',
    action: () => {
      if (raft.currentPhase === 'show-all-wires') {
        raft.startPhase('idle')
      }
      else {
        setRaftToolbarPressed('wiresBtn')
        raft.startPhase('show-all-wires')
        raft.hlTiles.clear()
      }
    },
  },

}

export const raftToolbarElements: Array<RaftElem>
  = RAFT_TOOLBAR_BUTTONS.map(layoutKey => ({
    layoutKey,
    display: {
      type: 'button',
      icon: allToolButtons[layoutKey].icon,
    },
    clickAction: allToolButtons[layoutKey].action,
  }))

export function setRaftToolbarPressed(pressedBtn?: ToolName) {
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
    gamepadPrompt: { name: 'LB' },
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
    gamepadPrompt: { name: 'RB' },
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
    gamepadPrompt: {
      name: 'start',
      offset: [0, 16],
    },
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
  let currentButtonName
  for (const [buttonName, params] of Object.entries(allToolButtons)) {
    if (params.phase === raft.currentPhase) {
      currentButtonName = buttonName
    }
  }
  const i = RAFT_TOOLBAR_BUTTONS.indexOf(currentButtonName)
  const n = RAFT_TOOLBAR_BUTTONS.length
  const buttonName = RAFT_TOOLBAR_BUTTONS[(i + delta + n) % n]
  allToolButtons[buttonName].action()
}
