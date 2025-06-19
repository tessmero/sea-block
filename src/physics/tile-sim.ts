/**
 * @file tile-sim.ts
 *
 * Physics simulation for water tiles that oscillate up and down.
 */

import { Simulation } from './simulation'
import { Tile } from '../tile'
import { GridIndex } from '../grid-logic/grid-index'
import { WATER_FRICTION, WATER_CENTERING, WATER_DAMPING, WATER_SPRING } from '../settings'

export class TileSim extends Simulation<Tile> {
  private readonly n: number
  private readonly springs: Spring[]
  public readonly pos: Float32Array
  public readonly vel: Float32Array
  constructor(private readonly grid: GridIndex) {
    super()

    this.springs = buildSprings(grid)

    this.n = grid.n
    this.pos = new Float32Array(this.n)
    this.vel = new Float32Array(this.n)
  }

  step(tiles: Tile[]) {
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

  // used for debugging
  hitTile(x: number, z: number): void {
    const acc = 2e-3
    const i = this.grid.xzToIndex(x, z)
    this.vel[i] += acc
  }

  accelTile(index: number, accel: number): void {
    this.vel[index] -= accel
  }

  // partially reset water tile that looped to opposite side
  resetTile(index: number) {
    const limitPos = 2
    this.pos[index] = Math.max(-limitPos, Math.min(limitPos, this.pos[index]))

    const limitVel = 1e-3
    this.vel[index] = Math.max(-limitVel, Math.min(limitVel, this.vel[index]))
  }
}

type Spring = {
  indexA: number
  indexB: number
  weight: number
}

function buildSprings(grid: GridIndex): Spring[] {
  const lowWeight = 1 / Math.SQRT2
  const springSpecs: Array<[number, number, number]> = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, lowWeight],
    [1, -1, lowWeight],
    [-1, -1, lowWeight],
    [-1, 1, lowWeight],
  ]

  const { width, depth } = grid
  const springs = []
  for (const { x, z, index } of grid.cells()) {
    for (const [dx, dz, weight] of springSpecs) {
      // get wrapped neighbor coords
      const ox = (x + dx + width) % width
      const oy = (z + dz + depth) % depth
      const indexB = grid.xzToIndex(ox, oy)

      if (index < indexB) { // prevent duplicating
        springs.push({ indexA: index, indexB, weight })
      }
    }
  }
  return springs
}
