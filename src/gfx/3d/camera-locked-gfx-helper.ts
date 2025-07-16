/**
 * @file camera-locked-gfx-helper.ts
 *
 * Used in sea-block.ts to help with gui meshes that are locked to the camera.
 */

import type { Group, Object3D, PerspectiveCamera } from 'three'
import type { Rectangle } from '../../util/layout-parser'
import type { CompositeMesh } from './composite-mesh'

export function alignGuiGroup(guiGroup: Group, camera: PerspectiveCamera, depth = -10) {
  const fov = camera.fov * (Math.PI / 180)
  const height = 2 * Math.abs(depth) * Math.tan(fov / 2)
  const width = height * camera.aspect

  const scaleX = width / window.innerWidth
  const scaleY = height / window.innerHeight

  guiGroup.position.copy(camera.position)
  guiGroup.quaternion.copy(camera.quaternion)
  guiGroup.translateZ(depth)

  guiGroup.scale.set(scaleX, scaleY, 1)
}

export function alignMeshInGuiGroup(childMesh: CompositeMesh | Object3D, guiGroup: Group, childRect: Rectangle) {
  // Position: center of the rectangle, relative to top-left
  const x = childRect.x + childRect.w / 2 - window.innerWidth / 2
  const y = window.innerHeight / 2 - (childRect.y + childRect.h / 2)

  childMesh.position.set(x, y, 0)

  // Scale: match rectangle size
  childMesh.scale.set(childRect.w, childRect.h, 1)
}
