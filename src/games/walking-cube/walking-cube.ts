/**
 * @file walking-cube.ts
 *
 * Waslking cube character included in walking-cube and raft-drive games.
 */

import type { GameElement, GameUpdateContext } from 'games/game'
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { wasdInputState } from 'guis/elements/wasd-buttons'
import { FaceTextureGfx } from './wc-face-texture-gfx'
import { getLeftJoystickInput } from 'guis/elements/joysticks'
import { lerp } from 'three/src/math/MathUtils.js'
import { FaceMeshGfx } from './wc-face-mesh-gfx'

function makeBox(
  width: number, height: number, depth: number,
  color: string, opts?: { hasFaceTexture?: boolean, hasFaceMesh?: boolean },
): GameElement {
  return {
    meshLoader: async () => {
      const plainBox = new Mesh(
        new BoxGeometry(width, height, depth),
        new MeshBasicMaterial({ color }),
      )
      if (opts?.hasFaceTexture) {
        return FaceTextureGfx.getTorsoWithTexturedFace(plainBox)
      }
      else if (opts?.hasFaceMesh) {
        return FaceMeshGfx.getTorsoWithEyeMeshes(plainBox)
      }
      else {
        return plainBox
      }
    },
  }
}

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

type ControlMode = 'default' | 'raft'

export class WalkingCube {
  leftFoot: GameElement
  rightFoot: GameElement
  torso: GameElement
  public torsoPos: Vector3
  private torsoAngle = 0
  private torsoVel: Vector3
  private torsoAvel = 0
  private moveX = 0
  private moveZ = 0
  private feet: Record<'left' | 'right', Foot>

  public controlMode: ControlMode = 'default'

  // Fixed y-values for torso and feet
  private y0: number
  private TORSO_Y: number
  private FOOT_Y: number
  private FOOT_DIST: number
  private MAX_FOOT_DIST: number
  private WALK_SPEED: number
  private FOOT_SLIDE_SPEED: number

  constructor(y0 = 11.5) {
    this.y0 = y0
    this.TORSO_Y = y0 + 0.6
    this.FOOT_Y = y0 + 0.05
    this.FOOT_DIST = 0.3
    this.MAX_FOOT_DIST = 1
    this.WALK_SPEED = 0.006
    this.FOOT_SLIDE_SPEED = this.WALK_SPEED * 0.9

    this.torsoPos = new Vector3(0, this.TORSO_Y, 0)
    this.torsoVel = new Vector3(0, 0, 0)
    this.leftFoot = makeBox(0.3, 0.1, 0.5, 'black')
    this.rightFoot = makeBox(0.3, 0.1, 0.5, 'black')
    this.torso = makeBox(1, 1, 1, 'white', {
      // hasFaceTexture: true, // render with one face textured
      hasFaceMesh: true, // or, render with added meshes
    })
    this.feet = {
      left: {
        state: 'anchored',
        pos: new Vector3(-this.FOOT_DIST, this.FOOT_Y, 0),
        angle: 0,
      },
      right: {
        state: 'anchored',
        pos: new Vector3(this.FOOT_DIST, this.FOOT_Y, 0),
        angle: 0,
      },
    }
  }

  reset() {
    this.torsoPos = new Vector3(0, this.TORSO_Y, 0)
    this.torsoAngle = 0
    this.torsoVel = new Vector3(0, 0, 0)
    this.torsoAvel = 0
    this.moveX = 0
    this.moveZ = 0
    this.feet.left = {
      state: 'anchored',
      pos: new Vector3(-this.FOOT_DIST, this.FOOT_Y, 0),
      angle: 0,
    }
    this.feet.right = {
      state: 'anchored',
      pos: new Vector3(this.FOOT_DIST, this.FOOT_Y, 0),
      angle: 0,
    }
  }

  update(context: GameUpdateContext) {
    if (this.controlMode === 'default') {
      this._pollLeftHandInput(context, true) // relative to camera
      this._updateDefaultControls(context)
    }
    else {
      this._pollLeftHandInput(context, false) // relative to parent
      this._updateRaftControls(context)
    }
  }

  private _updateRaftControls(context: GameUpdateContext) {
    const { dt } = context
    this.torsoAngle = Math.PI / 2
    this.torsoPos.set(-this.moveZ / 2, 1.5, this.moveX / 2)
    this._updateMeshesRaft(dt)

    //
    // this._updateWalkingFeet(dt)
  }

  private _updateDefaultControls(context: GameUpdateContext) {
    const { dt } = context

    // update logical torso
    if (this.moveX !== 0 || this.moveZ !== 0) {
      this.torsoVel.set(this.moveX, 0, this.moveZ).normalize().multiplyScalar(this.WALK_SPEED * dt)
      this.torsoAngle = Math.atan2(this.moveX, this.moveZ)
    }
    else {
      this.torsoVel.set(0, 0, 0)
    }
    this.torsoPos.add(this.torsoVel)

    // update logical feet
    this._updateWalkingFeet(dt)

    // update meshes based on logical feet and torso
    this._updateMeshesDefault()
  }

  private _pollLeftHandInput(context: GameUpdateContext, relativeToCamera = false) {
    const { seaBlock } = context
    const { camera, orbitControls } = seaBlock

    if (relativeToCamera) {
      forward.set(
        camera.position.x - orbitControls.target.x,
        0,
        camera.position.z - orbitControls.target.z,
      )
      if (forward.lengthSq() > 0) forward.normalize()
      else forward.set(0, 0, 1)
    }
    else {
      forward.set(0, 0, 1)
    }

    right.crossVectors(forward, fixedUp)

    const isUpHeld = wasdInputState['upBtn']
    const isDownHeld = wasdInputState['downBtn']
    const isLeftHeld = wasdInputState['leftBtn']
    const isRightHeld = wasdInputState['rightBtn']

    moveVec.set(0, 0, 0)
    if (isUpHeld) moveVec.sub(forward)
    if (isDownHeld) moveVec.add(forward)
    if (isLeftHeld) moveVec.add(right)
    if (isRightHeld) moveVec.sub(right)

    const joyInput = getLeftJoystickInput()
    if (joyInput) {
      const { x, y } = joyInput
      moveVec.addScaledVector(right, -x * 2 * Math.SQRT2)
      moveVec.addScaledVector(forward, y * 2 * Math.SQRT2)
    }

    this.moveX = moveVec.x
    this.moveZ = moveVec.z
  }

  private _restRelPos(footName: 'left' | 'right') {
    const sign = footName === 'left' ? -1 : 1
    const angle = this.torsoAngle + sign * Math.PI / 2
    return new Vector3(
      Math.sin(angle) * this.FOOT_DIST,
      this.FOOT_Y - this.TORSO_Y,
      Math.cos(angle) * this.FOOT_DIST,
    )
  }

  private _pickFootTarget(footName: 'left' | 'right') {
    const rest = this._restRelPos(footName)
    const moveVec = new Vector3(this.moveX, 0, this.moveZ).normalize().multiplyScalar(this.MAX_FOOT_DIST * 0.7)
    return rest.add(moveVec)
  }

  private _updateMeshesRaft(_dt: number) {
    const y = 0
    const rad = 0.5 // distance from center x/z to foot x/z

    // use logical torso position to place mesh
    if (this.torso.mesh) {
      this.torso.mesh.position.copy(this.torsoPos)
      this.torso.mesh.setRotationFromAxisAngle(upAxis, this.torsoAngle)
    }

    // ignore logical feet and just place meshes
    if (this.leftFoot.mesh) {
      const { mesh } = this.leftFoot
      mesh.position.set(0, y, -rad)
      mesh.setRotationFromAxisAngle(upAxis, 0)
    }
    if (this.rightFoot.mesh) {
      const { mesh } = this.rightFoot
      mesh.position.set(0, y, rad)
      mesh.setRotationFromAxisAngle(upAxis, 0)
    }
  }

  private _updateWalkingFeet(dt: number) {
    let areAnySliding = Object.values(this.feet).some(f => f.state === 'sliding')
    for (const [footName, foot] of Object.entries(this.feet) as Array<['left' | 'right', Foot]>) {
      if (foot.state === 'anchored') {
        const relPos = foot.pos.clone().sub(this.torsoPos)
        const dist = relPos.length()
        if (dist > this.MAX_FOOT_DIST && !areAnySliding) {
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
        const t = sfoot.t + this.FOOT_SLIDE_SPEED * dt
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
  }

  // apply logical feet/torso position to meshes
  private _updateMeshesDefault() {
    if (this.leftFoot.mesh) {
      const { mesh } = this.leftFoot
      const { pos, angle } = this.feet.left
      mesh.position.copy(pos)
      mesh.setRotationFromAxisAngle(upAxis, angle)
    }
    if (this.rightFoot.mesh) {
      const { mesh } = this.rightFoot
      const { pos, angle } = this.feet.right
      mesh.position.copy(pos)
      mesh.setRotationFromAxisAngle(upAxis, angle)
    }
    if (this.torso.mesh) {
      this.torso.mesh.position.copy(this.torsoPos)
      this.torso.mesh.setRotationFromAxisAngle(upAxis, this.torsoAngle)
    }
  }
}

// used when computing acel for cam anchor
const fixedUp = { x: 0, y: 1, z: 0 } as const
const forward = new Vector3()
const right = new Vector3()
const moveVec = new Vector3()
const upAxis = new Vector3(0, 1, 0)

// Usage:
// const wc = new WalkingCube()
// wc.update(context)
// wc.leftFoot, wc.rightFoot, wc.torso for elements
