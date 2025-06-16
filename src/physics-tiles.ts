import { GridConfig } from './grid-config'
import { WATER_FRICTION, WATER_SPRING, WATER_CENTERING, WATER_DAMPING } from './settings'

export class PhysicsTiles {
  private config: GridConfig
  private n: number
  private pos: Float32Array
  private vel: Float32Array
  private springs: Array<[number, number, number]>

  constructor(config: GridConfig) {
    this.config = config
    this.n = config.widthSegments * config.depthSegments
    this.pos = new Float32Array(this.n)
    this.vel = new Float32Array(this.n)
    this.springs = []

    const sqrt2 = Math.SQRT2
    const springSpecs: Array<[number, number, number]> = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, sqrt2],
      [1, -1, sqrt2],
      [-1, -1, sqrt2],
      [-1, 1, sqrt2],
    ]

    const w = config.widthSegments
    const h = config.depthSegments
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        for (const [dx, dy, strength] of springSpecs) {
          const ox = (x + dx + w) % w
          const oy = (y + dy + h) % h
          const indexA = this._getIndex(x, y)
          const indexB = this._getIndex(ox, oy)
          if (indexA < indexB) {
            this.springs.push([indexA, indexB, strength])
          }
        }
      }
    }
  }

  public getPos(i: number) {
    return this.pos[i]
  }

  private _getIndex(x: number, z: number): number {
    return this.config.xzToIndex(x, z)
  }

  // used for debugging
  hitTile(x: number, z: number): void {
    const acc = 2e-3
    const i = this._getIndex(x, z)
    this.vel[i] += acc
  }

  accelTile(index: number, accel: number): void {
    this.vel[index] -= accel
  }

  update(dt: number): void {
    const fric = WATER_FRICTION
    const spring = WATER_SPRING
    const damping = WATER_DAMPING
    const centering = WATER_CENTERING
    const fricMul = Math.pow(1 - fric, dt)

    for (const [ai, bi, strength] of this.springs) {
      const d = this.pos[bi] - this.pos[ai]
      const relVel = this.vel[bi] - this.vel[ai]
      const springForce = d * strength * spring
      const dampingForce = relVel * damping
      const acc = springForce + dampingForce

      // throw error if acc is nan
      if (isNaN(this.vel[ai]) || isNaN(this.vel[bi])) {
        throw new Error(`Invalid velocity at indices ${ai} and ${bi}: vel[${ai}]=${this.vel[ai]}, vel[${bi}]=${this.vel[bi]}`)
      }

      this.vel[ai] += acc
      this.vel[bi] -= acc
    }

    for (let i = 0; i < this.n; i++) {
      let p = this.pos[i]
      let v = this.vel[i]
      const centerForce = -p * centering
      v = v + centerForce * dt
      p = p + v * dt
      v = v * fricMul
      this.pos[i] = p
      this.vel[i] = v

      // throw error if p is nan
      if (isNaN(p) || isNaN(v)) {
        throw new Error(`Invalid position or velocity at index ${i}: pos=${p}, vel=${v}`)
      }
    }
  }

  get size(): number {
    return this.n
  }

  getTileOffset(x: number, y: number): number {
    return this.pos[this._getIndex(x, y)]
  }
}
