/**
 * @file free-cam-game.ts
 *
 * Like sphere-test, but without the sphere.
 */
import { Color, Vector3 } from 'three'
import { CAMERA_LOOK_AT } from 'settings'
import type { SeaBlock } from 'sea-block'
import { freeCamGameConfig } from 'configs/imp/free-cam-game-config'
import type { Sphere } from 'core/sphere'
import { wasdInputState } from 'guis/elements/wasd-buttons'
import { getLeftJoystickInput, leftDead, orbitWithRightJoystick } from 'guis/elements/joysticks'
import { Game } from '../game'
import type { GameUpdateContext } from '../game'
import { ChessWaveMaker } from 'games/chess/chess-wave-maker'
import { freecamPickableElements, targetElements, updateFreecamPickables } from 'games/free-cam/freecam-pickable-meshes'
import { gamepadState } from 'input/gamepad-input'

export const MOUSE_DEADZONE = 50 // (px) center of screen with zero force
export const MOUSE_MAX_RAD = 200 // (px) radius with max force
// const mouseVec = new Vector2()
const force = new Vector3()
// const lastScreenPosDummy = new Vector2()
const posDummy = new Vector3()

// used when computing acel for cam anchor
const fixedUp = { x: 0, y: 1, z: 0 } as const
const forward = new Vector3()
const right = new Vector3()
const moveVec = new Vector3()

export class FreeCamGame extends Game {
  static {
    Game.register('free-cam', {
      factory: () => new FreeCamGame(),
      guiName: 'free-cam',
      elements: [
        ...Object.values(freecamPickableElements), // chess piece appearing randomly on terrain
        ...Object.values(targetElements), // anchor that piece lerps towards
      ],
    })
  }

  public doesAllowOrbitControls(_context: SeaBlock): boolean {
    // const lyt = context.config.flatConfig.freeCamLayout
    // if (lyt === 'landscape') {
    //   return false // use right joystick instead of orbit controls
    // }
    return true
  }

  public readonly config = freeCamGameConfig

  // assigned post-construction in reset()
  protected cameraAnchor!: Sphere
  protected waveMaker!: ChessWaveMaker

  protected _lastAnchorPosition = new Vector3()

  public reset(context: SeaBlock): void {
    const { sphereGroup } = context

    // init ghost sphere to act as camera anchor
    this.cameraAnchor = sphereGroup.members[0]
    this.cameraAnchor.isGhost = true
    this.cameraAnchor.isVisible = false
    sphereGroup.setInstanceColor(0, new Color(0x00ff00))
    const { x, z } = context.terrain.centerXZ // this.cameraAnchor.position
    this.cameraAnchor.position.set(x, 30, z)
    this._lastAnchorPosition.copy(this.cameraAnchor.position)

    // sphere to interact with water and make waves
    this.waveMaker = new ChessWaveMaker(sphereGroup.members[1], context)

    // pan terrain,camera,target based on anchor x/z
    this.centerOnAnchor(context)

    // clickable meshes in world
    // initFreecamPickables(context)
  }

  public resetCamera(context: SeaBlock): void {
    // position camera
    const { x, z } = this.cameraAnchor.position
    const cam = this.getCamOffset(context)
    context.camera.position.set(x + cam.x, cam.y, z + cam.z)
  }

  public update(context: GameUpdateContext): void {
    const { seaBlock, dt } = context

    // if (targetElement.layoutKey) {
    //   // mesh is grabbed and in gui
    //   pickablePieceMesh.rotateY(0.005 * dt) // add spinning animation
    // }

    this.waveMaker.wmRadius = seaBlock.config.flatConfig.visibleRadius / 2
    this.waveMaker.sphere.scalePressure = 0.5

    updateFreecamPickables(dt)

    // pan grid if necessary
    this.centerOnAnchor(seaBlock)

    // accel wave maker towards center
    this.waveMaker.updateWaveMaker(context)
    // this.updateWaveMaker(dt)

    const { CAM_ACCEL } = this.config.flatConfig
    const { camera } = seaBlock

    // 1. Calculate camera-to-anchor direction in xz-plane (projected forward)
    forward.set(
      camera.position.x - this.cameraAnchor.position.x,
      0,
      camera.position.z - this.cameraAnchor.position.z,
    )
    if (forward.lengthSq() > 0) forward.normalize()
    else forward.set(0, 0, 1) // fallback

    // 2. Compute right vector in xz-plane (perpendicular to forward)
    // Cross product with up (0,1,0) for rightward direction
    right.crossVectors(forward, fixedUp)

    // 3. Build movement vector from input
    const isInSettings = seaBlock.isShowingSettingsMenu
    const isUpHeld = wasdInputState['upBtn'] && !isInSettings
    const isDownHeld = wasdInputState['downBtn'] && !isInSettings
    const isLeftHeld = wasdInputState['leftBtn'] && !isInSettings
    const isRightHeld = wasdInputState['rightBtn'] && !isInSettings

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

    let moveMagnitude = 0
    if (moveVec.lengthSq() > 0) {
      // moveVec.normalize()
      moveMagnitude = 1
    }

    // left joystick input
    const joyInput = getLeftJoystickInput()
    if (joyInput) {
      const { x, y } = joyInput
      moveMagnitude = Math.min(1, (Math.hypot(x, y) - leftDead) * 2)
      moveVec.addScaledVector(right, -x)
      moveVec.addScaledVector(forward, y)
    }

    // 4. Apply movement to intersection (copy anchor position first)
    const step = 10
    posDummy.copy(this.cameraAnchor.position)
      .addScaledVector(moveVec, step)

    this.accelSphere(this.cameraAnchor, posDummy, dt * CAM_ACCEL * moveMagnitude)

    orbitWithRightJoystick(context) // gui/elements/joysticks.ts

    zoomWithTriggers(context)
  }

  protected accelSphere(sphere: Sphere, intersection: Vector3, magnitude: number) {
    // direction from sphere to intersection, zero y
    force.set(
      intersection.x - sphere.position.x,
      0,
      intersection.z - sphere.position.z,
    ).normalize()

    force.multiplyScalar(magnitude)
    sphere.velocity.x += force.x
    sphere.velocity.z += force.z
  }

  protected centerOnAnchor(context: SeaBlock) {
    const { cameraAnchor } = this
    const { terrain, camera, orbitControls: controls } = context

    if (!cameraAnchor) return

    const { x, z } = cameraAnchor.position
    camera.position.set(
      x + (camera.position.x - this._lastAnchorPosition.x),
      camera.position.y, // y + (camera.position.y - lastPlayerPosition.y),
      z + (camera.position.z - this._lastAnchorPosition.z),
    )
    this._lastAnchorPosition.copy(cameraAnchor.position)
    controls.target.set(x, CAMERA_LOOK_AT.y, z)
    controls.update()

    terrain.panToCenter(x, z)
  }
}

// expose private methods of OrbitControls
type HackedOrbitControls = {
  _getZoomScale: (number) => number
  _dollyIn: (number) => void
  _dollyOut: (number) => void
}

export function zoomWithTriggers(context: GameUpdateContext) {
  const { seaBlock, dt } = context
  const orbitControls = seaBlock.orbitControls as unknown as HackedOrbitControls
  const input = (gamepadState.ButtonLT as number) - (gamepadState.ButtonRT as number)
  const delta = 1e0 * dt * input

  if (delta < 0) {
    orbitControls._dollyIn(orbitControls._getZoomScale(delta))
  }
  else if (delta > 0) {
    orbitControls._dollyOut(orbitControls._getZoomScale(delta))
  }
}
