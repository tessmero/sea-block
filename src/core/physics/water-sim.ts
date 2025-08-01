/**
 * @file water-sim.ts
 *
 * Physics simulation for water tiles that oscillate up and down.
 */

// let DEBUG_lastTiles = null

import type { Tile } from '../tile'
import type { TiledGrid } from '../grid-logic/tiled-grid'
import type { TileIndex } from '../grid-logic/indexed-grid'
import { physicsConfig } from '../../configs/physics-config'
import { TileSim } from './tile-sim'

export class WaterSim extends TileSim {
  // y position and velocity for each tile
  public readonly pos: Float32Array
  public readonly vel: Float32Array

  constructor(grid: TiledGrid) {
    super(grid)

    this.pos = new Float32Array(this.n)
    this.vel = new Float32Array(this.n)
  }

  step(tiles: Array<Tile>) {
    // debug
    // DEBUG_lastTiles = tiles

    const {
      WATER_FRICTION, WATER_CENTERING,
      WATER_DAMPING, WATER_SPRING,
    } = physicsConfig.flatConfig

    const fricMul = 1 - WATER_FRICTION

    for (const { indexA, indexB, weight } of this.springs) {
      if (!tiles[indexA].isWater) {
        continue
      }
      if (!tiles[indexB].isWater) {
        continue
      }
      const d = this.pos[indexB] - this.pos[indexA]
      const relVel = this.vel[indexB] - this.vel[indexA]
      const springForce = d * weight * WATER_SPRING
      const dampingForce = relVel * WATER_DAMPING
      const acc = springForce + dampingForce

      this.vel[indexA] += acc
      this.vel[indexB] -= acc
    }

    for (let i = 0; i < this.n; i++) {
      let p = this.pos[i]
      let v = this.vel[i]
      const centerForce = -p * WATER_CENTERING
      v = v + centerForce
      p = p + v
      v = v * fricMul
      this.pos[i] = p
      this.vel[i] = v
    }
  }

  getWavePos(i: number) {
    return this.pos[i] * physicsConfig.flatConfig.WAVE_AMPLITUDE
  }

  // used for debugging
  hitTile(x: number, z: number, i: number): void {
    // // debug
    // if (DEBUG_lastTiles) {
    //   const tile = DEBUG_lastTiles[i]
    //   console.log(`hit tile ${x}, ${z}, ${i},
    //   ${tile.position.x.toFixed(3)},${tile.position.z.toFixed(3)}`)
    // }

    const acc = -2e-3
    this.vel[i] += acc
  }

  accelTile(idx: TileIndex, accel: number): void {
    this.vel[idx.i] -= accel
  }

  // partially reset water tile that looped to opposite side
  resetTile(index: number) {
    const limitPos = 0// 3e-2
    // this.pos[index] = -limitPos + 2 * limitPos * Math.random()
    this.pos[index] = Math.max(-limitPos, Math.min(limitPos, this.pos[index]))

    const limitVel = 1e-3
    // this.vel[index] = -limitVel + 2 * limitVel * Math.random()
    Math.max(-limitVel, Math.min(limitVel, this.vel[index]))
  }
}
