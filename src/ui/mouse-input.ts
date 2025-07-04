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

let onScreen = false
const screenPos = new THREE.Vector2()
const dummy = new THREE.Vector2()

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
  if (!onScreen) {
    return null
  }

  const { terrain, camera, debugElems } = params

  // for (const subgoup of terrain.subgroups) {
  //   subgoup.mesh.computeBoundingSphere()
  // }

  // Plane at camera target y
  dummy.x = (screenPos.x / window.innerWidth) * 2 - 1
  dummy.y = -(screenPos.y / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(dummy, camera)
  raycaster.ray.intersectPlane(planeY, intersection)

  // pick tile on terrain
  const { x, z } = terrain.grid.positionToCoord(intersection.x, intersection.z)
  const pickedTile = terrain.grid.xzToIndex(x, z)

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
  if (pickedTile) {
    const { i: pickedMemberId } = pickedTile
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
      if (adjIndex) {
        const adjTile = terrain.members[adjIndex.i]
        debugTile(debugElems.adjacent[i], adjTile)
      }
    }
    // for (let i = adjOffsets.length; i < debugElems.adjacent.length; i++) {
    //   debugElems.adjacent[i].visible = false
    // }

    const diagOffsets = terrain.grid.tiling.getDiagonal(x, z)
    for (const [i, offset] of diagOffsets.entries()) {
      const diagIndex = grid.xzToIndex(x + offset.x, z + offset.z)
      if (diagIndex) {
        const diagTile = terrain.members[diagIndex.i]
        debugTile(debugElems.diagonal[i], diagTile)
      }
    }
    // for (let i = diagOffsets.length; i < debugElems.diagonal.length; i++) {
    //   debugElems.diagonal[i].visible = false
    // }
  }

  return {
    screenPos,
    intersection,
    pickedTile,
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
      () => { onScreen = false },
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
            screenPos.x = touch.clientX
            screenPos.y = touch.clientY
          }
          else {
            screenPos.x = touch.pageX
            screenPos.y = touch.pageY
          }
        }
        else if ('clientX' in event && 'clientY' in event) {
          screenPos.x = (event as MouseEvent).clientX
          screenPos.y = (event as MouseEvent).clientY
        }

        onScreen = true
        event.preventDefault()
      },
    )
  }
}
