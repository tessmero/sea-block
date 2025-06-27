/**
 * @file mouse-input.ts
 *
 * Mouse input to control player sphere.
 */

import * as THREE from 'three'
import { CAMERA_LOOK_AT, MOUSE_DEADZONE, MOUSE_MAX_RAD } from '../settings'
import { physicsConfig } from '../configs/physics-config'
import { Sphere } from '../sphere'
import { TileGroup } from '../groups/tile-group'
import { DebugElems } from '../scene'
import { gridConfig } from '../configs/grid-config'
import { Tile } from '../tile'

let showDebugTiles = false

let mouseX: number
let mouseY: number
const mouseVec = new THREE.Vector2()

const planeY = new THREE.Plane(
  new THREE.Vector3(0, 1, 0), -CAMERA_LOOK_AT.y,
)
const raycaster = new THREE.Raycaster()
const intersection = new THREE.Vector3()
const force = new THREE.Vector3()

export type ProcessMousePArams = {
  terrain: TileGroup
  player: Sphere
  camera: THREE.Camera
  debugElems: DebugElems
}

export function processMouse(params: ProcessMousePArams): void {
  if (typeof mouseX !== 'number' || typeof mouseY !== 'number') {
    return
  }

  const { terrain, player, camera, debugElems } = params

  // for (const subgoup of terrain.subgroups) {
  //   subgoup.mesh.computeBoundingSphere()
  // }

  // Plane at camera target y
  mouseVec.x = (mouseX / window.innerWidth) * 2 - 1
  mouseVec.y = -(mouseY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouseVec, camera)
  raycaster.ray.intersectPlane(planeY, intersection)

  // Direction from player to intersection, zero y
  force.set(
    intersection.x - player.position.x,
    0,
    intersection.z - player.position.z,
  ).normalize()

  // get distance from center of screen
  mouseVec.x = mouseX - window.innerWidth / 2
  mouseVec.y = mouseY - window.innerHeight / 2
  const screenDistance = mouseVec.length()

  if (gridConfig.flatValues.debug === 'none') {
    // Accelerate player in this direction
    let mouseRatio = (screenDistance - MOUSE_DEADZONE) / (MOUSE_MAX_RAD - MOUSE_DEADZONE)
    mouseRatio = Math.min(1, Math.max(0, mouseRatio))
    force.multiplyScalar(physicsConfig.flatValues.PLAYER_ACCEL * mouseRatio)
    player.velocity.x += force.x
    player.velocity.z += force.z
  }

  // pick tile on terrain
  const pickedMemberId = null
  const closest = null
  // for (const subgroup of terrain.subgroups) {
  //   const intersects = raycaster.intersectObject(subgroup.mesh)
  //   for (const picked of intersects) {
  //     if (picked.instanceId >= 0) {
  //     // If this is the closest so far, store it
  //       if (!closest || picked.distance < closest.distance) {
  //         closest = picked
  //         pickedMemberId = subgroup.memberIds[picked.instanceId]
  //       }
  //     }
  //   }
  // }

  // update debug elements
  showDebugTiles = gridConfig.flatValues.debug === 'pick-tile'
  debugElems.directionPoint.position.copy(intersection)
  if (pickedMemberId) {
    const grid = terrain.grid

    const centerTile = terrain.members[pickedMemberId]
    const { x, z } = grid.indexToXZ(pickedMemberId)
    debugTile(debugElems.center, centerTile)

    if (centerTile && centerTile.normal) {
      debugTile(debugElems.normalArrow, centerTile)
      debugElems.normalArrow.setDirection(centerTile.normal)
    }

    const adjOffsets = terrain.grid.tiling.getAdjacent(x, z)
    for (const [i, offset] of adjOffsets.entries()) {
      const adjIndex = grid.xzToIndex(x + offset.x, z + offset.z)
      const adjTile = terrain.members[adjIndex]
      debugTile(debugElems.adjacent[i], adjTile)
    }
    for (let i = adjOffsets.length; i < debugElems.adjacent.length; i++) {
      debugElems.adjacent[i].visible = false
    }

    const diagOffsets = terrain.grid.tiling.getDiagonal(x, z)
    for (const [i, offset] of diagOffsets.entries()) {
      const diagIndex = grid.xzToIndex(x + offset.x, z + offset.z)
      const diagTile = terrain.members[diagIndex]
      debugTile(debugElems.diagonal[i], diagTile)
    }
    for (let i = diagOffsets.length; i < debugElems.diagonal.length; i++) {
      debugElems.diagonal[i].visible = false
    }
  }
  // return { directionPoint: intersection, pickedTileId: instanceId }
}

function debugTile(debugElem: THREE.Object3D, tile: Tile) {
  if (!tile) {
    debugElem.position.set(0, -1000, 0)
    return
  }
  const { x, y, z } = tile.position
  debugElem.position.set(x, y * 2, z)
  debugElem.visible = showDebugTiles
}

export function initMouseListeners(element: HTMLCanvasElement) {
  const forgetOn = ['mouseleave']
  for (const eventType of forgetOn) {
    element.addEventListener(
      eventType,
      () => {
        mouseX = null
        mouseY = null
      },
    )
  }
  const pollOn = [
    'mousemove',
    'touchstart',
    'touchmove',
  ]
  for (const eventType of pollOn) {
    element.addEventListener(
      eventType,
      (event: Event) => {
        if ('touches' in event && (event as TouchEvent).touches.length > 0) {
          const touch = (event as TouchEvent).touches[0]
          if (typeof touch.clientX === 'number' && typeof touch.clientY === 'number') {
            mouseX = touch.clientX
            mouseY = touch.clientY
          }
          else {
            mouseX = touch.pageX
            mouseY = touch.pageY
          }
        }
        else if ('clientX' in event && 'clientY' in event) {
          mouseX = (event as MouseEvent).clientX
          mouseY = (event as MouseEvent).clientY
        }

        window.event.preventDefault()
      },
    )
  }
}
