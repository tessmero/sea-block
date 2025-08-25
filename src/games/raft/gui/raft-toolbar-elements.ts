/**
 * @file raft-toolbar-elements.ts
 *
 * Gui elements always on screen in raft game
 * (though they may be covered by a dialog).
 */

import type { ElementEvent, GuiElement } from 'guis/gui'
import type { RaftLayoutKey } from 'guis/keys/raft-layout-keys'
import { raft } from '../raft'

type RaftElem = GuiElement<RaftLayoutKey>

export const RAFT_TOOLBAR_BUTTONS = [
  // 'placeFloorBtn',
  'placeButtonBtn', 'placeThrusterBtn', 'wiresBtn',
] as const satisfies ReadonlyArray<RaftLayoutKey>

const actions: Record<(typeof RAFT_TOOLBAR_BUTTONS)[number], (e: ElementEvent) => void> = {
  // placeFloorBtn: () => {
  //   raft.startPhase(`place-floor`)
  // },
  placeButtonBtn: () => {
    raft.startPhase(`place-button`)
  },
  placeThrusterBtn: () => {
    raft.startPhase(`place-thruster`)
  },
  wiresBtn: () => {
    raft.startPhase('wires')
  },
}

const userFriendlyLabels: Record<(typeof RAFT_TOOLBAR_BUTTONS)[number], string> = {
  // placeFloorBtn: 'Floor',
  placeButtonBtn: 'Button',
  placeThrusterBtn: 'Thruster',
  wiresBtn: 'Wires',
}

export const raftToolbarElements = RAFT_TOOLBAR_BUTTONS.map(layoutKey => ({
  layoutKey,
  display: {
    type: 'button',
    label: userFriendlyLabels[layoutKey],
  },
  clickAction: actions[layoutKey],
}) satisfies RaftElem)
