/**
 * @file locate-on-screen.ts
 *
 * Locate 3d world position in 2d layered-viewport coordinates.
 * USed to locate chess board tiles for puppet test.
 * Used to position gamepad button prompts on 3d cursor.
 */

import type { SeaBlock } from 'sea-block'
import type { Vector3Like } from 'three'
import { Vector3 } from 'three'
import { Vector2 } from 'three'

// get rectangle for test-support
export function tsLocateOnScreen(seaBlock: SeaBlock, worldPos: Vector3) {
  const { x, y } = locateOnScreen(seaBlock, worldPos)
  const ps = seaBlock.config.flatConfig.pixelScale
  const size = 50
  return [
    // square centered on mesh
    x * ps - size / 2,
    y * ps - size / 2,
    size, size,
  ]
}

const dummy2 = new Vector2()
const dummy3 = new Vector3()

export function locateOnScreen(seaBlock: SeaBlock, worldPos: Vector3Like): Vector2 {
  const { camera, layeredViewport } = seaBlock

  // Project world position to normalized device coordinates (NDC)
  const ndc = dummy3.copy(worldPos).project(camera)
  dummy2.set(
    (ndc.x + 1) / 2 * layeredViewport.w,
    (1 - ndc.y) / 2 * layeredViewport.h,
  )
  return dummy2
}
