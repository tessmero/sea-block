/**
 * @file mouse-touch-input.ts
 *
 * Keeps track of multitouch and mouse user input, and passes
 * some inputs through to three.js orbit controls.
 */

// expose private methods of OrbitControls
type HackedOrbitControls = {
  _onMouseDown: (event: Event) => void
  _onMouseMove: (event: Event) => void
  _onMouseWheel: (event: Event) => void
  _dollyIn: (number) => void
  _dollyOut: (number) => void
  state: number
  enabled: boolean // eslint-disable-line @typescript-eslint/naming-convention
}

// id of touch dragging orbit camera
let dragOrbitId: ProcessedSubEvent | undefined = undefined

// id of second simultanious touch zooming orbit camera
let zoomOrbitId: ProcessedSubEvent | undefined = undefined
let pinchDistance: number | undefined = undefined

import * as THREE from 'three'
import type { InputId } from 'input-id'
import { CAMERA_LOOK_AT } from './settings'
import type { TileIndex } from './core/grid-logic/indexed-grid'
import type { SeaBlock } from './sea-block'

export let isTouchDevice = false // set to true on first touch event -> ignore mouse events

type SubEvent = {
  screenPos: THREE.Vector2
  touchId: InputId
}

// mouse input in terms of viewport and tile grid
export interface ProcessedSubEvent {
  seaBlock: SeaBlock // context
  event: Event // raw event
  screenPos: THREE.Vector2 // point in viewport in browser px
  lvPos: THREE.Vector2 // poitn in viewport in layeredViewport big pixels
  intersection: THREE.Vector3 // picked point at sea level
  pickedTileIndex?: TileIndex // picked tile in world
  inputId: InputId
}

type EventHandler = {
  on: ReadonlyArray<string> // event types
  action: (event: ProcessedSubEvent, context: SeaBlock) => void
}

const handlers: ReadonlyArray<EventHandler> = [
  {
    on: ['mouseleave'],
    action: (_event, _context) => {
      // callbacks.unclick()
      // isOnScreen = false
    },
  },
  {
    on: [
      'mousemove',
      'touchmove',
    ],
    action: (event, context) => {
      const orbitControls = context.orbitControls as unknown as HackedOrbitControls
      // event.preventDefault()

      const isDraggingOrbitControls = (event.inputId === dragOrbitId?.inputId)
      const isZoomingOrbitControls = (event.inputId === zoomOrbitId?.inputId)
      if (isDraggingOrbitControls) {
        dragOrbitId = event
      }

      let hasConsumed = false
      if (!isDraggingOrbitControls && !isZoomingOrbitControls) {
        // hasConsumed = context.game.gui.move(event)
        // console.log('mouse-touch-input -> mouseMoveGuiLayers')
        hasConsumed = context.mouseMoveGuiLayers(event)
      }

      if (!isDraggingOrbitControls && !hasConsumed && dragOrbitId
        && (!zoomOrbitId || isZoomingOrbitControls)) {
        zoomOrbitId = event
        // this is second simultanious touc on background (pinch)
        if (typeof pinchDistance !== 'number') {
          // just started pinch
          pinchDistance = event.screenPos.distanceTo(dragOrbitId!.screenPos)
          // setDebugText(`new pinch ${pinchDistance}`)
        }
        else {
          // ongoing pinch
          const newDist = event.screenPos.distanceTo(dragOrbitId!.screenPos)
          const delta = newDist - pinchDistance
          // setDebugText(`pinch ${delta}`)
          pinchDistance = newDist

          const dollyDelta = 1e-2 * delta
          orbitControls._dollyOut(1 + dollyDelta)
        }
      }

      if (isDraggingOrbitControls && !hasConsumed) {
        // emulate left mouse button on orbit controls
        const simulatedEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          detail: 1,
          screenX: event.screenPos.x,
          screenY: event.screenPos.y,
          clientX: event.screenPos.x,
          clientY: event.screenPos.y,
          button: 0, // Left button
          buttons: 1, // Left button pressed
        })
        if (orbitControls.enabled) orbitControls._onMouseMove(simulatedEvent)
      }
    },
  },
  {
    on: [
      'mousedown',
      'touchstart',
    ],
    action: (event, context) => {
      // // un-focus debug gui controls so keyboard controls work
      // try {
      //   (document.activeElement as HTMLElement).blur()
      // }
      // catch (_e) {
      //   // do nothing
      // }

      const hasConsumed = context.clickGuiLayers(event)
      // const hasConsumed = context.game.gui.click(event)

      if (!hasConsumed && (typeof dragOrbitId === 'undefined')) {
        dragOrbitId = event
        const orbitControls = context.orbitControls as unknown as HackedOrbitControls

        // Create a MouseEvent with properties matching the touch event (left button)
        const simulatedEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          detail: 1,
          screenX: event.screenPos.x,
          screenY: event.screenPos.y,
          clientX: event.screenPos.x,
          clientY: event.screenPos.y,
          button: 0, // Left button
          buttons: 1, // Left button pressed
        })
        orbitControls._onMouseDown(simulatedEvent)
      }
      // if (isTouchDevice) event.preventDefault()
    },
  },
  {
    on: [
      'mouseup',
      'touchend',
      'touchcancel',
    ],
    action: (event, context) => {
      if (event.inputId === dragOrbitId?.inputId) {
        const orbitControls = context.orbitControls as unknown as HackedOrbitControls
        orbitControls.state = -1 // stop dragging
        pinchDistance = undefined // stop pinching
        dragOrbitId = undefined
      }

      if (event.inputId === zoomOrbitId?.inputId) {
        pinchDistance = undefined // stop pinching
        zoomOrbitId = undefined
      }

      context.unclickGuiLayers(event)
      // context.game.gui.unclick(event)
      // event.preventDefault()
    },
  },
]

export function initMouseListeners(
  seaBlock: SeaBlock,
) {
  const { layeredViewport } = seaBlock
  const { frontCanvas } = layeredViewport

  for (const { on, action } of handlers) {
    for (const eventType of on) {
      frontCanvas.addEventListener(eventType,
        (event: Event) => {
          handleEvent(seaBlock, event, action)
        },
      )
    }
  }

  // conditionally pass events to orbit controls
  const orbitControls = seaBlock.orbitControls as unknown as HackedOrbitControls
  frontCanvas.addEventListener('wheel', (event) => {
    orbitControls._onMouseWheel(event)
  })
}

// let isOnScreen = false

// const screenPos = new THREE.Vector2()
const lvPos = new THREE.Vector2()
const dummy = new THREE.Vector2()

const planeNormal = new THREE.Vector3(0, -1, 0)
const planeY = new THREE.Plane(
  planeNormal, CAMERA_LOOK_AT.y,
)
export function setTilePickY(y: number) {
  planeY.constant = y
}

const raycaster = new THREE.Raycaster()
const intersection = new THREE.Vector3()

export function handleEvent(
  seaBlock: SeaBlock, event: Event,
  action: (event: ProcessedSubEvent, context: SeaBlock) => void,
) {
  if (isTouchDevice && event.type.startsWith('mouse')) {
    return // ignore event
  }

  // if (!isOnScreen) {
  //   seaBlock.mouseState = undefined
  //   return
  // }

  const { terrain, camera, layeredViewport } = seaBlock

  // for (const subgoup of terrain.subgroups) {
  //   subgoup.mesh.computeBoundingSphere()
  // }

  const subEvents = _breakUpEvent(event)

  for (const sub of subEvents) {
    const screenPos = sub.screenPos

    // Plane at camera target y
    dummy.x = (screenPos.x / window.innerWidth) * 2 - 1
    dummy.y = -(screenPos.y / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(dummy, camera)
    raycaster.ray.intersectPlane(planeY, intersection)

    // pick tile on terrain
    const { x, z } = terrain.grid.positionToCoord(intersection.x, intersection.z)
    const pickedTile = terrain.grid.xzToIndex(x, z)

    lvPos.x = screenPos.x * layeredViewport.pixelRatio
    lvPos.y = screenPos.y * layeredViewport.pixelRatio

    if (!isTouchDevice && event.type.startsWith('touch')) {
      isTouchDevice = true // assume all future events are touch
    }

    // do event-type-specific action
    action({
      seaBlock,
      event,
      screenPos,
      lvPos,
      intersection,
      pickedTileIndex: pickedTile,
      inputId: sub.touchId,
    }, seaBlock)
  }
}

function _breakUpEvent(event: Event): Array<SubEvent> {
  const result: Array<SubEvent> = []
  if ('changedTouches' in event && (event as TouchEvent).changedTouches.length > 0) {
    for (const touch of (event as TouchEvent).changedTouches) {
      if (typeof touch.clientX === 'number' && typeof touch.clientY === 'number') {
        result.push({
          screenPos: new THREE.Vector2(
            touch.clientX,
            touch.clientY,
          ),
          touchId: touch.identifier,
        })
      }
      else {
        result.push({
          screenPos: new THREE.Vector2(
            touch.pageX,
            touch.pageY,
          ),
          touchId: touch.identifier,
        })
      }
    }
  }
  else if ('clientX' in event && 'clientY' in event) {
    result.push({
      screenPos: new THREE.Vector2(
        (event as MouseEvent).clientX,
        (event as MouseEvent).clientY,
      ),
      touchId: 'mouse',
    })
  }

  return result
}

/// // DEBUG
// function setDebugText(msg) {
//   debugOverlay.textContent = msg
// }
// const debugOverlay = document.createElement('div')
// debugOverlay.id = 'debug-overlay'
// Object.assign(debugOverlay.style, {
//   position: 'fixed',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   zIndex: '99999',
//   background: 'rgba(0,0,0,0.85)',
//   color: '#fff',
//   padding: '16px 30px',
//   borderRadius: '8px',
//   boxShadow: '0 2px 18px rgba(0,0,0,0.3)',
//   fontFamily: 'monospace',
//   fontSize: '1.1rem',
//   pointerEvents: 'none',
//   textAlign: 'center',
//   maxWidth: '90vw',
//   maxHeight: '80vh',
//   overflow: 'auto',
// })
// debugOverlay.textContent = 'Debug: Everything loaded correctly!'
// document.body.appendChild(debugOverlay)
