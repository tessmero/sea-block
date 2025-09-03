/**
 * @file flora-sim.ts
 *
 * Simulation for vegetation on top of tiles, swaying in the wind.
 *
 * Siimilar to water-sim, but with motion along xz instead of y.
 */

import { createNoise2D } from 'simplex-noise'
import type { TiledGrid } from '../grid-logic/tiled-grid'
import type { Tile } from '../tile'
import { floraConfig } from '../../configs/imp/flora-config'
import { TileSim } from './tile-sim'

const noise2D = createNoise2D()
let t = 0 // number of steps simulated

export class FloraSim extends TileSim {
  // pos and vel have 2D, stored as xzxz...
  public readonly pos: Float32Array
  public readonly vel: Float32Array

  constructor(grid: TiledGrid) {
    super(grid)

    // prepare to keep track of x and z motion for each tile
    this.pos = new Float32Array(this.n * 2)
    this.vel = new Float32Array(this.n * 2)
  }

  step(tiles: Array<Tile>) {
    const {
      FLORA_FRICTION, FLORA_CENTERING,
      FLORA_DAMPING, FLORA_SPRING, FLORA_TEMPERATURE,
    } = floraConfig.flatConfig

    const fricMul = 1 - FLORA_FRICTION

    // const windForce = 1e-3 * noise2D(1e-3 * (t++), 0)
    // const windAngle = noise2D(1e-3 * (t++), 0)
    // const windX = windForce * Math.cos(windAngle)
    // const windZ = windForce * Math.sin(windAngle)

    const windX = 1e-4 * noise2D(1e-3 * (t++), 0)
    const windZ = 1e-4 * noise2D(1e5 + 1e-3 * (t++), 0)

    // Apply spring and damping forces between neighbors in both X and Z
    for (const { indexA, indexB, weight } of this.springs) {
      if (!tiles[indexA].isFlora) {
        continue
      }
      if (!tiles[indexB].isFlora) {
        continue
      }

      // For 2D interleaved storage: index*2 for x, index*2+1 for z
      const dx = this.pos[indexB * 2] - this.pos[indexA * 2]
      const dz = this.pos[indexB * 2 + 1] - this.pos[indexA * 2 + 1]

      const relVelX = this.vel[indexB * 2] - this.vel[indexA * 2]
      const relVelZ = this.vel[indexB * 2 + 1] - this.vel[indexA * 2 + 1]

      const springForceX = dx * weight * FLORA_SPRING
      const springForceZ = dz * weight * FLORA_SPRING

      const dampingForceX = relVelX * FLORA_DAMPING
      const dampingForceZ = relVelZ * FLORA_DAMPING

      const accX = springForceX + dampingForceX + windX + FLORA_TEMPERATURE * (Math.random() - 0.5)
      const accZ = springForceZ + dampingForceZ + windZ + FLORA_TEMPERATURE * (Math.random() - 0.5)

      this.vel[indexA * 2] += accX
      this.vel[indexA * 2 + 1] += accZ
      this.vel[indexB * 2] -= accX
      this.vel[indexB * 2 + 1] -= accZ
    }

    // Apply centering, integrate motion, and apply friction for both X and Z components
    for (let i = 0; i < this.n; i++) {
      let px = this.pos[i * 2]
      let pz = this.pos[i * 2 + 1]
      let vx = this.vel[i * 2]
      let vz = this.vel[i * 2 + 1]

      const centerForceX = -px * FLORA_CENTERING
      const centerForceZ = -pz * FLORA_CENTERING

      vx += centerForceX
      vz += centerForceZ

      px += vx
      pz += vz

      vx *= fricMul
      vz *= fricMul

      this.pos[i * 2] = px
      this.pos[i * 2 + 1] = pz
      this.vel[i * 2] = vx
      this.vel[i * 2 + 1] = vz
    }
  }
}
