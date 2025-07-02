/**
 * @file mouse-input.ts
 *
 * Mouse input to control player sphere.
 */

import * as THREE from 'three'
import { CAMERA_LOOK_AT } from '../settings'
import { TileGroup } from '../groups/tile-group'
import { DebugElems } from '../scene'
import { gridConfig } from '../configs/grid-config'
import { Tile } from '../tile'
import { MouseState } from '../games/game'

let showDebugTiles = false

let mouseX: number
let mouseY: number
const mouseVec = new THREE.Vector2()

const planeY = new THREE.Plane(
  new THREE.Vector3(0, 1, 0), -CAMERA_LOOK_AT.y,
)
const raycaster = new THREE.Raycaster()
const intersection = new THREE.Vector3()

export type ProcessMouseParams = {
  terrain: TileGroup
  camera: THREE.Camera
  debugElems: DebugElems
}

export function processMouse(params: ProcessMouseParams): MouseState {
  if (typeof mouseX !== 'number' || typeof mouseY !== 'number') {
    return
  }

  const { terrain, camera, debugElems } = params

  // for (const subgoup of terrain.subgroups) {
  //   subgoup.mesh.computeBoundingSphere()
  // }

  // Plane at camera target y
  mouseVec.x = (mouseX / window.innerWidth) * 2 - 1
  mouseVec.y = -(mouseY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouseVec, camera)
  raycaster.ray.intersectPlane(planeY, intersection)

  // pick tile on terrain
  const { x, z } = terrain.grid.positionToCoord(intersection.x, intersection.z)
  const pickedMemberId = terrain.grid.xzToIndex(x, z)

  // // pick tile precisely, not supported since addding TileMesh
  // const closest = null
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

  // const { mouseControl } = gridConfig.flatValues
  // if (mouseControl === 'direct-sphere') {
  // }
  // else if (mouseControl === 'touch-water') {
  // if (pickedMemberId !== -1) {
  //   terrain.sim.hitTile(x, z, pickedMemberId)
  // }
  // }

  // update debug elements
  const debug = gridConfig.children.debug.value
  showDebugTiles = debug === 'pick-tile'
  debugElems.directionPoint.position.copy(intersection)
  if (pickedMemberId !== -1) {
    const grid = terrain.grid

    const centerTile = terrain.members[pickedMemberId]
    // console.log(`debug center tile with id ${pickedMemberId},
    // ${centerTile.position.x.toFixed(3)},${centerTile.position.z.toFixed(3)}`)
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

  return {
    screenPos: mouseVec,
    intersection,
    x, z, index: pickedMemberId,
  }
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
