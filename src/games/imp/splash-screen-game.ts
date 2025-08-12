/**
 * @file splash-screen-game.ts
 *
 * Game that runs before user clicks "launch".
 */

import { Vector3 } from 'three'
import { freeCamGameConfig } from 'configs/free-cam-game-config'
import { Game, type GameUpdateContext } from '../game'
import { FreeCamGame } from './free-cam-game'

const target = new Vector3(-1e9, 30, -1e9)

const nearCam = new Vector3(6, 20, 6)
const nearTarget = new Vector3(0, -5, 0)

export class SplashScreenGame extends FreeCamGame {
  static {
    Game.register('splash-screen', {
      factory: () => new SplashScreenGame(),
      guiName: 'splash-screen',
    })
  }

  public getCamOffset(): Vector3 { return nearCam }
  protected getCamTargetOffset(): Vector3 {
    return nearTarget
  }

  public doesAllowOrbitControls(): boolean {
    return false
  }

  public update(context: GameUpdateContext): void {
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
    this.waveMaker.position.set(x + 7, 13, z + 7)
    this.waveMaker.scalePressure = 0.2

    const cto = this.getCamTargetOffset()
    orbitControls.target.set(x + cto.x, cto.y, z + cto.z)
    orbitControls.update()
  }
}
