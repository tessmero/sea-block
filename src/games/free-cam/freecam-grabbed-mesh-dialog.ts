/**
 * @file freecam-grabbed-mesh-dialog.ts
 *
 * Dialog appears after clicking pickable mesh in free-cam.
 */

import type { PickableName, PickableParams } from 'games/free-cam/freecam-pickable-meshes'
import { cancelClicked, PICKABLE_NAMES, playClicked } from 'games/free-cam/freecam-pickable-meshes'
import { getImage } from 'gfx/2d/image-asset-loader'
import { addToSpriteAtlas } from 'gfx/2d/sprite-atlas'
import { drawText } from 'gfx/2d/text-gfx-helper'
import type { GuiElement } from 'guis/gui'
import type { FreecamLayoutKey } from 'guis/keys/freecam-layout-keys'
import { allPickableParams } from './freecam-pickables'

type FreecamElem = GuiElement<FreecamLayoutKey>

export const grabbedMeshDiagram: FreecamElem = {
  layoutKey: 'grabbedMeshDiagram',
  display: {
    type: 'diagram',
    label: `grabbed-mesh-diagram`, // give imageset unique hash
    isVisible: false,
  },
}

// called on startup
export async function preloadGrabbedMeshDiagrams() {
  for (const name of PICKABLE_NAMES) {
    const params = allPickableParams[name]
    _buildGrabbedMeshDiagram(params)
  }
}

// dialog after clicking chess piece in free-cam
const grabbedMeshDiagrams: Array<HTMLCanvasElement> = []
function _buildGrabbedMeshDiagram(params: PickableParams) {
  // Create canvas for diagram
  const buffer = document.createElement('canvas')
  buffer.width = 64
  buffer.height = 40

  const { width, height } = buffer
  const ctx = buffer.getContext('2d') as CanvasRenderingContext2D
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = 'black'
  // ctx.strokeRect(0.5, 0.5, width - 1, height - 1)

  // draw chess piece icon
  const iconImage = getImage(params.icon)
  ctx.drawImage(iconImage, ...params.iconOffset, iconImage.width, iconImage.height)

  // draw text
  drawText(ctx, { width, height, label: params.title, offset: [6, 3] })

  // draw text
  drawText(ctx, { width, height, label: params.subtitle, font: 'mini', offset: [0, -12] })

  // Add to sprite atlas
  addToSpriteAtlas(buffer)
  grabbedMeshDiagrams.push(buffer)
}

export function updateGrabbedMeshDiagram(name: PickableName) {
  const buffer = grabbedMeshDiagram.display.imageset?.default
  if (!buffer) {
    throw new Error('grabbedMeshDiagram element has no buffer')
  }
  const { width, height } = buffer
  const ctx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D
  ctx.clearRect(0, 0, width, height)

  const i = PICKABLE_NAMES.indexOf(name)
  if (i === -1) return
  ctx.drawImage(grabbedMeshDiagrams[i], 0, 0)
}

export const grabbedMeshPanel: FreecamElem = {
  layoutKey: 'grabbedMeshPanel',
  display: {
    type: 'panel',
    isVisible: false,
  },
}
export const grabbedMeshPlayButton: FreecamElem = {
  layoutKey: 'grabbedMeshPlayButton',
  display: {
    type: 'button',
    label: 'Play',
    isVisible: false,
  },
  clickAction: playClicked,
}
export const grabbedMeshCancelButton: FreecamElem = {
  layoutKey: 'grabbedMeshCancelButton',
  display: {
    type: 'button',
    label: 'Cancel',
    isVisible: false,
  },
  clickAction: cancelClicked,
}
export const grabbedMeshElements = [
  grabbedMeshPanel,
  grabbedMeshDiagram,
  grabbedMeshPlayButton, grabbedMeshCancelButton,
]
