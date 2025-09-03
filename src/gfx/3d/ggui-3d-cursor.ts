/**
 * @file ggui-3d-cursor.ts
 *
 * Additional mesh that appears when using gamepad instead of
 * mouse/touch to select something in 3d world.
 */

type GguiHandler = {
  selectAction: (_inputid: InputId, _axisValue: number) => boolean | void
  navAction: (_angle: number) => void
}
export let gguiHandler: GguiHandler | null = null

import type { InputId } from 'input/input-id'
import { CylinderGeometry, Mesh, MeshBasicMaterial } from 'three'

const s = 0.5
export const gguiCursorMesh = new Mesh(
  new CylinderGeometry(0.5, 0, 1, 5, 1).scale(s, s, s).translate(0, 2, 0),
  new MeshBasicMaterial({ color: 'white' }),
)

gguiCursorMesh.visible = false
export function hideGguiCursor() {
  gguiCursorMesh.visible = false
  gguiHandler = null
  // gguiSelectAction = () => {}
  // gguiNavAction = () => {}
}

export function setGguiHandler(handler: GguiHandler) {
  gguiHandler = handler
}

// export let gguiSelectAction = (_inputid: InputId, _axisValue: number): boolean | void => {}
// export function setGguiSelectAction(action: (inputid: InputId, axisValue: number) => boolean | void) {
//   gguiSelectAction = action
// }

// export let gguiNavAction = (_angle: number) => {}
// export function setGguiNavAction(action: (angle?: number) => boolean | void) {
//   gguiNavAction = action
// }
