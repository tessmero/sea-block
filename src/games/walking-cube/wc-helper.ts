/**
 * @file wc-helper.ts
 *
 * Logic and helpers for the walking cube game.
 */
import type { GameElement, GameUpdateContext } from 'games/game'
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3, Group, PlaneGeometry } from 'three'
import { wasdInputState } from 'guis/elements/wasd-buttons'
import type { SeaBlock } from 'sea-block'
import { FaceGfx } from './wc-face-gfx'
import { getLeftJoystickInput, orbitWithRightJoystick } from 'guis/elements/joysticks'
import { lerp } from 'three/src/math/MathUtils.js'

const box = (
  width: number, height: number, depth: number,
  color: string, opts?: { hasFace?: boolean },
): GameElement => ({
  meshLoader: async () => {
    if (opts?.hasFace) {
      // Build torso as a group: cube + face
      const group = new Group()
      const cube = new Mesh(
        new BoxGeometry(width, height, depth),
        new MeshBasicMaterial({ color }),
      )
      group.add(cube)
      // Build face mesh (square plane with face texture)
      const faceSize = 0.8 // slightly smaller than cube face
      const faceGeo = new PlaneGeometry(faceSize, faceSize)
      // Get face texture from FaceGfx
      const faceTex = FaceGfx.getFaceTexture({ eyesOpen: true, mouthOpen: false, fill: false })
      const faceMat = new MeshBasicMaterial({ map: faceTex, transparent: true })
      const faceMesh = new Mesh(faceGeo, faceMat)
      // Position faceMesh on front face (z+)
      faceMesh.position.z = 0.5 + 0.05 // front face, just above surface
      group.add(faceMesh)
      return group
    }
    else {
      return new Mesh(
        new BoxGeometry(width, height, depth),
        new MeshBasicMaterial({ color }),
      )
    }
  },
})

// Fixed y-values for torso and feet
const y0 = 11.5
const TORSO_Y = y0 + 0.6
const FOOT_Y = y0 + 0.05
const FOOT_DIST = 0.3 // distance from center to foot at rest
const MAX_FOOT_DIST = 1 // max distance before foot slides

const WALK_SPEED = 0.006 // speed of torso
const FOOT_SLIDE_SPEED = WALK_SPEED * 0.9 // units/ms relative to torso

export const leftFoot = box(0.3, 0.1, 0.5, 'black')
export const rightFoot = box(0.3, 0.1, 0.5, 'black')
export const torso = box(1, 1, 1, 'white', { hasFace: true })

function lerpVec3(a: Vector3, b: Vector3, t: number) {
  return new Vector3(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t,
  )
}

type Foot = AnchoredFoot | SlidingFoot

type AnchoredFoot = {
  state: 'sliding' | 'anchored'
  pos: Vector3
  angle: number

}

interface SlidingFoot extends AnchoredFoot {
  startRel: Vector3
  startAngle: number
  endRel: Vector3
  endAngle: number
  t: number
}

export class WalkingCubeLogic {
  torsoPos = new Vector3(0, TORSO_Y, 0)
  torsoAngle = 0
  torsoVel = new Vector3(0, 0, 0)
  torsoAvel = 0
  moveX = 0
  moveZ = 0
  feet: Record<'left' | 'right', Foot> = {
    left: {
      state: 'anchored',
      pos: new Vector3(-FOOT_DIST, FOOT_Y, 0),
      angle: 0,
    },
    right: {
      state: 'anchored',
      pos: new Vector3(FOOT_DIST, FOOT_Y, 0),
      angle: 0,
    },
  }

  reset() {
    this.torsoPos = new Vector3(0, TORSO_Y, 0)
    this.torsoAngle = 0
    this.torsoVel = new Vector3(0, 0, 0)
    this.torsoAvel = 0
    this.moveX = 0
    this.moveZ = 0
    this.feet.left = {
      state: 'anchored',
      pos: new Vector3(-FOOT_DIST, FOOT_Y, 0),
      angle: 0,
    }
    this.feet.right = {
      state: 'anchored',
      pos: new Vector3(FOOT_DIST, FOOT_Y, 0),
      angle: 0,
    }
  }

  update(context: GameUpdateContext) {
    const { seaBlock, dt } = context
    const { camera, orbitControls } = seaBlock

    // 1. Calculate camera-to-anchor direction in xz-plane (projected forward)
    forward.set(
      camera.position.x - orbitControls.target.x,
      0,
      camera.position.z - orbitControls.target.z,
    )
    if (forward.lengthSq() > 0) forward.normalize()
    else forward.set(0, 0, 1) // fallback

    // 2. Compute right vector in xz-plane (perpendicular to forward)
    // Cross product with up (0,1,0) for rightward direction
    right.crossVectors(forward, fixedUp)

    // 3. Build movement vector from input
    const isUpHeld = wasdInputState['upBtn']
    const isDownHeld = wasdInputState['downBtn']
    const isLeftHeld = wasdInputState['leftBtn']
    const isRightHeld = wasdInputState['rightBtn']

    // if (
    //   mouseState && !mouseState.isTouch // desktop mouse on screen
    //   && !this.flatUi.hoveredButton // no buttons hovered
    //   && Object.values(inputState).every(val => val === false) // no inputs held
    // ) {
    //   // allow scrolling with mouse at edge of screen
    //   const margin = 2 // thickness of edge region in big pixels
    //   const { x, y } = mouseState.lvPos
    //   const { w, h } = seaBlock.layeredViewport
    //   if (y < margin) isUpHeld = true
    //   if (y > h - margin) isDownHeld = true
    //   if (x < margin) isLeftHeld = true
    //   if (x > w - margin) isRightHeld = true
    // }

    // WASD input
    moveVec.set(0, 0, 0)
    if (isUpHeld) moveVec.sub(forward)
    if (isDownHeld) moveVec.add(forward)
    if (isLeftHeld) moveVec.add(right)
    if (isRightHeld) moveVec.sub(right)

    // let moveMagnitude = 0
    // if (moveVec.lengthSq() > 0) {
    //   // moveVec.normalize()
    //   moveMagnitude = 1
    // }

    // joystick input
    const joyInput = getLeftJoystickInput()
    if (joyInput) {
      const { x, y } = joyInput
      // moveMagnitude = Math.min(1, (Math.hypot(x, y) - leftDead) * 2)
      moveVec.addScaledVector(right, -x)
      moveVec.addScaledVector(forward, y)
    }
    orbitWithRightJoystick(seaBlock, dt) // gui/elements/joysticks.ts
    seaBlock.orbitControls.update()

    // update walking cube character
    this.moveX = moveVec.x
    this.moveZ = moveVec.z
    if (this.moveX !== 0 || this.moveZ !== 0) {
      this.torsoVel.set(this.moveX, 0, this.moveZ).normalize().multiplyScalar(WALK_SPEED * dt)
      this.torsoAngle = Math.atan2(this.moveX, this.moveZ)
    }
    else {
      this.torsoVel.set(0, 0, 0)
    }
    this.torsoPos.add(this.torsoVel)
    this._updateFeet(dt)
  }

  _restRelPos(footName: 'left' | 'right') {
    const sign = footName === 'left' ? -1 : 1
    const angle = this.torsoAngle + sign * Math.PI / 2
    return new Vector3(
      Math.sin(angle) * FOOT_DIST,
      FOOT_Y - TORSO_Y,
      Math.cos(angle) * FOOT_DIST,
    )
  }

  _pickFootTarget(footName: 'left' | 'right') {
    const rest = this._restRelPos(footName)
    const moveVec = new Vector3(this.moveX, 0, this.moveZ).normalize().multiplyScalar(MAX_FOOT_DIST * 0.7)
    return rest.add(moveVec)
  }

  _updateFeet(dt: number) {
    let areAnySliding = Object.values(this.feet).some(f => f.state === 'sliding')
    for (const [footName, foot] of Object.entries(this.feet) as Array<['left' | 'right', Foot]>) {
      if (foot.state === 'anchored') {
        const relPos = foot.pos.clone().sub(this.torsoPos)
        const dist = relPos.length()
        if (dist > MAX_FOOT_DIST && !areAnySliding) {
          areAnySliding = true
          const sfoot = foot as SlidingFoot
          sfoot.state = 'sliding'
          sfoot.startRel = relPos
          sfoot.startAngle = foot.angle
          sfoot.endRel = this._pickFootTarget(footName as 'left' | 'right')
          sfoot.endAngle = this.torsoAngle
          sfoot.t = 0
        }
      }
      else if (foot.state === 'sliding') {
        const sfoot = foot as SlidingFoot
        const { startRel, startAngle, endRel, endAngle } = sfoot
        const t = sfoot.t + FOOT_SLIDE_SPEED * dt
        sfoot.t = t
        if (sfoot.t > 1) {
          sfoot.state = 'anchored'
          sfoot.pos = this.torsoPos.clone().add(endRel)
          sfoot.angle = endAngle
        }
        else {
          sfoot.pos = this.torsoPos.clone().add(lerpVec3(startRel, endRel, t))
          sfoot.angle = lerp(startAngle, endAngle, t)
        }
      }
    }

    if (leftFoot.mesh) {
      const { mesh } = leftFoot
      const { pos, angle } = this.feet.left
      mesh.position.copy(pos)
      mesh.setRotationFromAxisAngle(upAxis, angle)
    }
    if (rightFoot.mesh) {
      const { mesh } = rightFoot
      const { pos, angle } = this.feet.right
      mesh.position.copy(pos)
      mesh.setRotationFromAxisAngle(upAxis, angle)
    }
    if (torso.mesh) {
      torso.mesh.position.copy(this.torsoPos)
      torso.mesh.setRotationFromAxisAngle(upAxis, this.torsoAngle)
    }
  }
}

// used when computing acel for cam anchor
const fixedUp = { x: 0, y: 1, z: 0 } as const
const forward = new Vector3()
const right = new Vector3()
const moveVec = new Vector3()

const upAxis = new Vector3(0, 1, 0)

export function resetWalkingCube(_context: SeaBlock) {
//   context.orbitControls.target.y = 12
//   context.orbitControls.update()
  walkingCubeLogic.reset()
}

export function updateWalkingCube(context: GameUpdateContext) {
  walkingCubeLogic.update(context)
}

export const walkingCubeElements = [leftFoot, rightFoot, torso]

export const walkingCubeLogic = new WalkingCubeLogic()
