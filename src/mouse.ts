/**
 * @file mouse.ts
 */

import * as THREE from 'three'
import { CAMERA_LOOK_AT, PLAYER_ACCEL, MOUSE_DEADZONE, MOUSE_MAX_RAD } from './settings'

let mouseX: number
let mouseY: number

export function updatePlayerMovement(player: Sphere, camera: THREE.Camera): THREE.Vector3 | null {
  if (typeof mouseX !== 'number' || typeof mouseY !== 'number') {
    return null
  }
  // chck if near center
  const dx = mouseX - window.innerWidth / 2
  const dy = mouseY - window.innerHeight / 2
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance < 50) {
    return null
  }

  // Raycast from camera through mouse to x/z plane
  const mouse = new THREE.Vector2(
    (mouseX / window.innerWidth) * 2 - 1,
    -(mouseY / window.innerHeight) * 2 + 1,
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // Plane at camera target y
  const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), -CAMERA_LOOK_AT.y)
  const intersection = new THREE.Vector3()
  raycaster.ray.intersectPlane(planeY, intersection)

  if (intersection) {
    // Direction from player to intersection, zero y
    const dir = new THREE.Vector3(
      intersection.x - player.position.x,
      0,
      intersection.z - player.position.z,
    ).normalize()

    // Accelerate player in this direction
    const mousePx = new THREE.Vector2(dx, dy)
    let mouseRatio = (mousePx.length() - MOUSE_DEADZONE) / (MOUSE_MAX_RAD - MOUSE_DEADZONE)
    mouseRatio = Math.min(1, Math.max(0, mouseRatio))
    dir.multiplyScalar(PLAYER_ACCEL * mouseRatio)
    player.velocity.x += dir.x
    player.velocity.z += dir.z
  }

  return intersection
}

export function initMouseListeners() {
  const listenFor = ['mousemove', 'touchstart', 'touchmove']
  listenFor.forEach((eventType) => {
    document.addEventListener(eventType, (event: Event) => {
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
      event.preventDefault()
    })
  })
}
