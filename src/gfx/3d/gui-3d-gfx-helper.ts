/**
 * @file gui-3d-gfx-helper.ts
 *
 * Used in sea-block.ts to help with gui meshes that are locked to the camera.
 */

import { Mesh, Object3D, type Group, type Material, type PerspectiveCamera } from 'three'
import type { Rectangle } from '../../util/layout-parser'
import type { GameElement } from 'games/game'

export function setMaterial(elem: GameElement | Object3D, mat: Material) {
  const mesh = (elem instanceof Object3D) ? elem : elem.mesh
  if (!mesh) {
    return
  }

  mesh.traverse((child) => {
    if (child instanceof Mesh) {
      if ((child as any).isOutline) {
        return // don't change material for outline mesh
      }

      child.material = mat
    }
  })
}

/**
 * Aligns the GUI group to the camera, scaling it to fit the given screenRect in world space.
 * @param guiGroup The group to align
 * @param camera The camera
 * @param screenRect The rectangle (in screen pixels) to fit the GUI group to
 * @param depth The Z offset from the camera
 */
export function alignGuiGroup(
  guiGroup: Group,
  camera: PerspectiveCamera,
  screenRect: Rectangle,
) {
  const { w, h } = screenRect
  const depth = w > h ? -20 : -40

  const fov = camera.fov * (Math.PI / 180)
  const height = 2 * Math.abs(depth) * Math.tan(fov / 2)
  // Use the screenRect height for scaling
  const scale = height / screenRect.h

  guiGroup.position.copy(camera.position)
  guiGroup.quaternion.copy(camera.quaternion)
  guiGroup.translateZ(depth)

  guiGroup.scale.set(scale, scale, scale)
}

export function alignMeshInGuiGroup(childMesh: Object3D, guiGroup: Group, screenRect: Rectangle, childRect: Rectangle) {
  // Position the mesh relative to the screenRect center
  const x = childRect.x + childRect.w / 2 - (screenRect.x + screenRect.w / 2)
  const y = (screenRect.y + screenRect.h / 2) - (childRect.y + childRect.h / 2)

  childMesh.position.set(x, y, 0)
  childMesh.scale.set(100, 100, 100)
}
