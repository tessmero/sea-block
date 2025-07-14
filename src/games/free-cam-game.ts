/**
 * @file free-cam-game.ts
 *
 * Like sphere-test, but without the sphere.
 */
import { Color, Vector2, Vector3 } from 'three'
import type { Sphere } from '../sphere'
import { CAMERA, CAMERA_LOOK_AT } from '../settings'
import type { TileIndex } from '../grid-logic/indexed-grid'
import type { SeaBlock } from '../sea-block'
import { freeCamGameConfig } from '../configs/free-cam-game-config'
import { Game } from './game'
import type { GameUpdateContext, MouseState } from './game'

export const MOUSE_DEADZONE = 50 // (px) center of screen with zero force
export const MOUSE_MAX_RAD = 200 // (px) radius with max force
const mouseVec = new Vector2()
const force = new Vector3()
const lastScreenPosDummy = new Vector2()

let _lastPickedTileIndex: TileIndex | undefined = undefined

// const btnWidth = 60
// const btnHeight = 20

export class FreeCamGame extends Game {
  static {
    Game.register('free-cam', {
      factory: () => new FreeCamGame(),
      elements: [
        // {
        //   layoutKey: 'randomize',
        //   imageLoader: simpleButtonLoader(btnWidth, btnHeight, 'RANDOMIZE'),
        //   clickAction: (seaBlock: SeaBlock) => {
        //     const tilingItem = seaBlock.config.tree.children.tiling
        //     tilingItem.value = randChoice(TILING_NAMES)
        //     seaBlock.onCtrlChange(tilingItem)
        //   },
        // },
      ],
      layout: {
        // randomize: { width: btnWidth, height: btnHeight, right: 2, bottom: 2 },
      },
    })
  }

  public readonly config = freeCamGameConfig

  // assigned post-construction in reset()
  protected cameraAnchor!: Sphere
  private waveMaker!: Sphere

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
    const { x, z } = this.cameraAnchor.position
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
    context.camera.position.set(x + CAMERA.x, CAMERA.y, z + CAMERA.z)
  }

  protected updateWaveMaker(dt: number, mouseState: MouseState | undefined, canIdle: boolean): void {
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
    this.flatUi.update(context)

    const { seaBlock, mouseState, dt } = context

    if (!this.hasMouseMoved && mouseState?.screenPos) {
      if (!this.lastScreenPos) {
        // get initial screen pos
        lastScreenPosDummy.copy(mouseState.screenPos)
        this.lastScreenPos = lastScreenPosDummy
      }
      else {
        // get new screen pos and compare
        const { x: lastX, y: lastY } = this.lastScreenPos
        const { x, y } = mouseState.screenPos
        if (lastX !== x || lastY !== y) {
          this.hasMouseMoved = true
        }
        else {
          // console.log(`mouse did not move`)
        }
      }
    }

    // pan grid if necessary
    this.centerOnAnchor(seaBlock)

    // accel wave maker towards center
    this.updateWaveMaker(dt, mouseState, true)

    if (!mouseState) {
      // mouse is not in viewport
      return // do not move camera
    }

    const { screenPos, intersection, pickedTileIndex } = mouseState

    // check if picked visible tile
    if (pickedTileIndex) {
      const tile = seaBlock.terrain.members[pickedTileIndex.i]
      if (tile.isVisible) {
        if (_lastPickedTileIndex !== pickedTileIndex) {
          _lastPickedTileIndex = pickedTileIndex

          // mouse just moved to visible tile, apply force to water
          // context.terrain.sim.accelTile(pickedTileIndex, 5e-5 * dt)
        }

        // picked visible tile. move wave makere
        // this.accelSphere(this.waveMaker, intersection, 1e-4)
        return // do not move camera
      }
    }

    if (!this.hasMouseMoved) {
      return // user is idle since reset, do not move camera
    }

    // accel cam anchor towards picked intersection point
    const { CAM_ACCEL } = this.config.flatConfig
    mouseVec.x = screenPos.x - window.innerWidth / 2
    mouseVec.y = screenPos.y - window.innerHeight / 2
    const screenDistance = mouseVec.length()
    let mouseRatio = (screenDistance - MOUSE_DEADZONE) / (MOUSE_MAX_RAD - MOUSE_DEADZONE)
    mouseRatio = Math.min(1, Math.max(0, mouseRatio))
    this.accelSphere(this.cameraAnchor, intersection, dt * CAM_ACCEL * mouseRatio)
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
