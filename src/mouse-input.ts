/**
 * @file mouse-input.ts
 *
 * Mouse input to control player sphere.
 */

import * as THREE from 'three'
import { CAMERA_LOOK_AT } from './settings'
import type { MouseState } from './games/game'
import type { LayeredViewport } from './gfx/layered-viewport'
import type { TileGroup } from './core/groups/tile-group'

type MouseCallbacks = {
  click: (event: Event, mousePos: THREE.Vector2) => void
  unclick: (event: Event) => void
}

type EventHandler = {
  on: ReadonlyArray<string> // event types
  action: (event: Event, callbacks: MouseCallbacks) => void
}

const handlers: ReadonlyArray<EventHandler> = [
  {
    on: ['mouseleave'],
    action: (_event, _callbacks) => {
      // callbacks.unclick()
      isOnScreen = false
    },
  },
  {
    on: [
      'mousemove',
      'touchmove',
    ],
    action: (event, _callbacks) => {
      _processMousePos(event)
      event.preventDefault()
    },
  },
  {
    on: [
      'mousedown',
      'touchstart',
    ],
    action: (event, callbacks) => {
      // // un-focus debug gui controls so keyboard controls work
      // try {
      //   (document.activeElement as HTMLElement).blur()
      // }
      // catch (_e) {
      //   // do nothing
      // }

      _processMousePos(event)
      callbacks.click(event, screenPos)
      event.preventDefault()
    },
  },
  {
    on: [
      'mouseup',
      'touchend',
      'touchcancel',
    ],
    action: (event, callbacks) => {
      callbacks.unclick(event)
      event.preventDefault()
    },
  },
]

export function initMouseListeners(
  layeredViewport: LayeredViewport,
  callbacks: MouseCallbacks,
) {
  const { frontCanvas } = layeredViewport

  for (const { on, action } of handlers) {
    for (const eventType of on) {
      frontCanvas.addEventListener(eventType,
        (event: Event) => action(event, callbacks),
      )
    }
  }
}

let isOnScreen = false

const screenPos = new THREE.Vector2()
const lvPos = new THREE.Vector2()
const dummy = new THREE.Vector2()

const planeY = new THREE.Plane(
  new THREE.Vector3(0, 1, 0), -CAMERA_LOOK_AT.y,
)
const raycaster = new THREE.Raycaster()
const intersection = new THREE.Vector3()

export interface ProcessMouseParams {
  layeredViewport: LayeredViewport
  terrain: TileGroup
  camera: THREE.Camera
}

export function processMouse(params: ProcessMouseParams): MouseState | undefined {
  if (!isOnScreen) {
    return undefined
  }

  const { terrain, camera } = params

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

  // // pick tile precisely, not supported since adding TileMesh
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

  lvPos.x = screenPos.x * params.layeredViewport.pixelRatio
  lvPos.y = screenPos.y * params.layeredViewport.pixelRatio

  return {
    screenPos,
    lvPos,
    intersection,
    pickedTileIndex: pickedTile,
  }
}

function _processMousePos(event: Event) {
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

  isOnScreen = true
}
