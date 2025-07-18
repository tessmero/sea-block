/**
 * @file splash-screen-game.ts
 *
 * Game that runs before user clicks "launch".
 */

import { Vector3 } from 'three'
import { freeCamGameConfig } from '../configs/free-cam-game-config'
import { simpleButtonLoader } from '../gfx/2d/flat-button'
import type { SeaBlock } from '../sea-block'
import { randomTransition } from '../gfx/transition'
import { Game, type GameUpdateContext } from './game'
import { FreeCamGame } from './free-cam-game'

const target = new Vector3(-1e9, 30, -1e9)

const btnWidth = 80
const btnHeight = 40 / 1.618

const nearCam = new Vector3(6, 20, 6)
const nearTarget = new Vector3(0, -5, 0)

export class SplashScreenGame extends FreeCamGame {
  static {
    Game.register('splash-screen', {
      factory: () => new SplashScreenGame(),
      elements: [
        {
          layoutKey: 'launch',
          hotkeys: ['Space'],
          imageLoader: simpleButtonLoader('LAUNCH'),
          clickAction: (seaBlock: SeaBlock) => {
            seaBlock.transition = randomTransition(seaBlock)
            seaBlock.isCovering = true
          },
        },
      ],
      layout: {
        launch: { width: btnWidth, height: btnHeight, left: 'auto', top: 'auto' },
      },
    })
  }

  protected getCamOffset(): Vector3 { return nearCam }
  protected getCamTargetOffset(): Vector3 {
    return nearTarget
  }

  public enableOrbitControls(): boolean {
    return false
  }

  public update(context: GameUpdateContext): void {
    this.flatUi.update(context)

    const { seaBlock } = context
    const { dt } = context
    const { terrain, orbitControls } = seaBlock

    // pan grid if necessary
    this.centerOnAnchor(seaBlock)

    // accel wave maker towards center
    // this.updateWaveMaker(dt, mouseState, false)
    // console.log(this.waveMaker.position)

    // // accel camera anchor towards fixed direction
    const { CAM_ACCEL } = freeCamGameConfig.flatConfig
    this.accelSphere(this.cameraAnchor, target, dt * CAM_ACCEL * 1e-1)

    // // set camera closer than normal
    const { x, z } = terrain.centerXZ
    this.waveMaker.position = new Vector3(x + 7, 13, z + 7)

    const cto = this.getCamTargetOffset()
    orbitControls.target.set(x + cto.x, cto.y, z + cto.z)
    orbitControls.update()
  }
}
