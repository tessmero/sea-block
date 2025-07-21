/**
 * @file mouse-input.ts
 *
 * Mouse input to control player sphere.
 */

import * as THREE from 'three'
import { CAMERA_LOOK_AT } from './settings'
import type { LayeredViewport } from './gfx/layered-viewport'
import type { TileGroup } from './core/groups/tile-group'
import type { TileIndex } from './core/grid-logic/indexed-grid'
import type { SeaBlock } from './sea-block'

// mouse input in terms of viewport and tile grid
export interface MouseState {
  screenPos: THREE.Vector2 // point in viewport in browser px
  lvPos: THREE.Vector2 // poitn in viewport in layeredViewport big pixels
  intersection: THREE.Vector3 // picked point in world
  pickedTileIndex?: TileIndex // picked tile in world
  isTouch?: boolean
}

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
    action: (_event, _callbacks) => {
      // event.preventDefault()
    },
  },
  {
    on: [
      'mousedown',
      'touchstart',
    ],
    action: (event, callbacks) => {
      // un-focus debug gui controls so keyboard controls work
      try {
        (document.activeElement as HTMLElement).blur()
      }
      catch (_e) {
        // do nothing
      }

      callbacks.click(event, screenPos)
      if (isTouch) event.preventDefault()
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
      // event.preventDefault()
    },
  },
]

export function initMouseListeners(
  seaBlock: SeaBlock,
  callbacks: MouseCallbacks,
) {
  const { layeredViewport } = seaBlock
  const { frontCanvas } = layeredViewport

  for (const { on, action } of handlers) {
    for (const eventType of on) {
      frontCanvas.addEventListener(eventType,
        (event: Event) => {
          processMouseEvent(seaBlock, event)
          action(event, callbacks)
        },
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

export function processMouseEvent(seaBlock: SeaBlock, event: Event) {
  _processMousePos(event)

  if (!isOnScreen) {
    seaBlock.mouseState = undefined
    return
  }

  const { terrain, camera, layeredViewport } = seaBlock

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

  lvPos.x = screenPos.x * layeredViewport.pixelRatio
  lvPos.y = screenPos.y * layeredViewport.pixelRatio

  if (!isTouch && event.type.startsWith('touch')) {
    isTouch = true // assume all future events are touch
  }

  seaBlock.mouseState = {
    screenPos,
    lvPos,
    intersection,
    pickedTileIndex: pickedTile,
    isTouch: isTouch,
  }
}

let isTouch = false

// update screenPos based on mouse/touch event
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
