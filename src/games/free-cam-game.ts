/**
 * @file free-cam-game.ts
 *
 * Like sphere-test, but without the sphere.
 */
import { Color, Vector2, Vector3 } from 'three'
import { CAMERA_LOOK_AT } from '../settings'
import type { SeaBlock } from '../sea-block'
import { freeCamGameConfig } from '../configs/free-cam-game-config'
import type { Sphere } from '../core/sphere'
import type { TileIndex } from '../core/grid-logic/indexed-grid'
import { FREECAM_DESKTOP_LAYOUT } from '../gui/layouts/freecam-desktop-layout'
import { FREECAM_PORTRAIT_LAYOUT } from '../gui/layouts/freecam-portrait-layout'
import { FREECAM_LANDSCAPE_LAYOUT } from '../gui/layouts/freecam-landscape-layout'
import type { ProcessedSubEvent } from '../mouse-touch-input'
import { wasdButtons, wasdInputState } from '../gui/elements/wasd-buttons'
import { configBtn, leftJoy, musicBtn, rightJoy } from '../gui/elements/misc-buttons'
import { Game } from './game'
import type { GameUpdateContext } from './game'

export const MOUSE_DEADZONE = 50 // (px) center of screen with zero force
export const MOUSE_MAX_RAD = 200 // (px) radius with max force
// const mouseVec = new Vector2()
const force = new Vector3()
const lastScreenPosDummy = new Vector2()
const targetDummy = new Vector3()

const _lastPickedTileIndex: TileIndex | undefined = undefined

export class FreeCamGame extends Game {
  static {
    Game.register('free-cam', {
      factory: () => new FreeCamGame(),
      elements: [
        musicBtn,
        configBtn,
        leftJoy,
        rightJoy,
        ...wasdButtons,
      ],
      layout: (context: SeaBlock) => {
        // context.config.refreshConfig()
        const lyt = context.config.flatConfig.freeCamLayout
        if (lyt === 'portrait') {
          return FREECAM_PORTRAIT_LAYOUT
        }
        else if (lyt === 'landscape') {
          return FREECAM_LANDSCAPE_LAYOUT
        }
        else {
          return FREECAM_DESKTOP_LAYOUT
        }
      },
    })
  }

  public doesAllowOrbitControls(context: SeaBlock): boolean {
    const lyt = context.config.flatConfig.freeCamLayout
    if (lyt === 'landscape') {
      return false // use right joystick instead
    }
    return true
  }

  public readonly config = freeCamGameConfig

  // assigned post-construction in reset()
  protected cameraAnchor!: Sphere
  protected waveMaker!: Sphere

  private hasMouseMoved: boolean = false // has user actually interacted since reset
  private lastScreenPos?: Vector2

  protected _lastAnchorPosition = new Vector3()

  public reset(context: SeaBlock): void {
    const { sphereGroup } = context

    this.hasMouseMoved = false
    this.lastScreenPos = undefined

    // init ghost sphere to act as camera anchor
    this.cameraAnchor = sphereGroup.members[0]
    this.cameraAnchor.isGhost = true
    this.cameraAnchor.isVisible = false
    sphereGroup.setInstanceColor(0, new Color(0x00ff00))
    const { x, z } = context.terrain.centerXZ // this.cameraAnchor.position
    this.cameraAnchor.position = new Vector3(x, 30, z)
    this._lastAnchorPosition.copy(this.cameraAnchor.position)

    // init sphere to interact with water and make waves
    this.waveMaker = sphereGroup.members[1]
    this.waveMaker.isGhost = false
    // this.waveMaker.isFish = true
    this.waveMaker.isVisible = false
    this.waveMaker.position = new Vector3(x, 20, z)
    sphereGroup.setInstanceColor(1, new Color(0xff0000))

    this.centerOnAnchor(context)
  }

  public resetCamera(context: SeaBlock): void {
    // position camera
    const { x, z } = this.cameraAnchor.position
    const cam = this.getCamOffset(context)
    context.camera.position.set(x + cam.x, cam.y, z + cam.z)
  }

  protected updateWaveMaker(dt: number, mouseState: ProcessedSubEvent | undefined, canIdle: boolean): void {
    const { x, z } = this.cameraAnchor.position
    if (this.hasMouseMoved && mouseState) {
      // move towards picked point
      this.accelSphere(this.waveMaker, mouseState.intersection, 1e-4 * dt)
    }
    else {
      if (canIdle) {
      // move to nowhere
        this.waveMaker.position = new Vector3(x, 20, z)
      }
      else {
      // move towards center
        this.accelSphere(this.waveMaker, new Vector3(x, 0, z), 1e-4 * dt)
      }
    }

    // respawn if fell under terrain
    if (this.waveMaker.position.y < 10) {
      this.waveMaker.position = new Vector3(x, 10, z)
    }
  }

  public update(context: GameUpdateContext): void {
    const { seaBlock, dt } = context
    const mouseState = undefined
    // const { mouseState } = seaBlock

    // if (!this.hasMouseMoved && mouseState?.screenPos) {
    //   if (!this.lastScreenPos) {
    //     // get initial screen pos
    //     lastScreenPosDummy.copy(mouseState.screenPos)
    //     this.lastScreenPos = lastScreenPosDummy
    //   }
    //   else {
    //     // get new screen pos and compare
    //     const { x: lastX, y: lastY } = this.lastScreenPos
    //     const { x, y } = mouseState.screenPos
    //     if (lastX !== x || lastY !== y) {
    //       this.hasMouseMoved = true
    //     }
    //     else {
    //       // console.log(`mouse did not move`)
    //     }
    //   }

    //   const { orbitControls, terrain } = seaBlock
    //   const { x, z } = terrain.centerXZ
    //   const cto = this.getCamTargetOffset()
    //   orbitControls.target.set(x + cto.x, cto.y, z + cto.z)
    //   orbitControls.update()
    // }

    // pan grid if necessary
    this.centerOnAnchor(seaBlock)

    // accel wave maker towards center
    this.updateWaveMaker(dt, mouseState, true)

    // accel cam anchor towards picked intersection point
    const { CAM_ACCEL } = this.config.flatConfig
    const { camera } = seaBlock

    // 1. Calculate camera-to-anchor direction in xz-plane (projected forward)
    const forward = new Vector3(
      camera.position.x - this.cameraAnchor.position.x,
      0,
      camera.position.z - this.cameraAnchor.position.z,
    )
    if (forward.lengthSq() > 0) forward.normalize()
    else forward.set(0, 0, 1) // fallback

    // 2. Compute right vector in xz-plane (perpendicular to forward)
    // Cross product with up (0,1,0) for rightward direction
    const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0))

    // 3. Build movement vector from input
    const moveVec = new Vector3()
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

    if (isUpHeld) moveVec.sub(forward)
    if (isDownHeld) moveVec.add(forward)
    if (isLeftHeld) moveVec.add(right)
    if (isRightHeld) moveVec.sub(right)

    if (moveVec.lengthSq() > 0) moveVec.normalize()

    // 4. Apply movement to intersection (copy anchor position first)
    const step = 10 // Or whatever step size you prefer
    targetDummy.copy(this.cameraAnchor.position)
      .addScaledVector(moveVec, step)

    this.accelSphere(this.cameraAnchor, targetDummy, dt * CAM_ACCEL)
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
