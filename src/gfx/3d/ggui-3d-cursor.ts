/**
 * @file ggui-3d-cursor.ts
 *
 * Additional mesh that appears when using gamepad instead of
 * mouse/touch to select something in 3d world.
 */

import type { InputId } from 'input/input-id'
import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

export const gguiCursorMesh = new Mesh(
  new SphereGeometry(0.5, 5, 5).translate(0, 2, 0),
  new MeshBasicMaterial({ color: 'white' }),
)

gguiCursorMesh.visible = false
export function hideGguiCursor() {
  gguiCursorMesh.visible = false
  gguiSelectAction = () => {}
  gguiNavAction = () => {}
}

export let gguiSelectAction = (_inputid: InputId, _axisValue: number) => {}
export function setGguiSelectAction(action: (inputid: InputId, axisValue: number) => void) {
  gguiSelectAction = action
}

export let gguiNavAction = (_angle: number) => {}
export function setGguiNavAction(action: (angle?: number) => void) {
  gguiNavAction = action
}
