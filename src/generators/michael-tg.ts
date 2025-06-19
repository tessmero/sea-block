/**
 * @file michael-tg.ts
 *
 * Terrain generator implementation adapted from
 * Michael2-3B/Procedural-Perlin-Terrain.
 */
import { NumericParam } from '../ui/controls-gui'
import { TerrainGenerator, RGBA } from './terrain-generator'

export type MichaelConfig = {
  seed: NumericParam
  offsetX: NumericParam
  offsetZ: NumericParam
  noiseMapValues: {
    persistence: NumericParam
    amplitude: NumericParam
    octaves: NumericParam
    wavelength: NumericParam
  }
  terrainCustomization: {
    exponent: NumericParam
    peaks: NumericParam
    waterLevel: NumericParam
    beachSize: NumericParam
  }
  lighting: {
    worldLight: NumericParam
    lightPosition: NumericParam
    lightHeight: NumericParam
  }
}

class SeedablePRNG {
  constructor(private seed: number) {}
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

export class MichaelTG extends TerrainGenerator<MichaelConfig> {
  private prng: SeedablePRNG

  constructor(config: MichaelConfig) {
    super(config)
    this.prng = new SeedablePRNG(config.seed.value)
  }

  static getDefaultConfig(): MichaelConfig {
    return {
      seed: { value: 0, min: 0, max: 10000, step: 1 },
      offsetX: { value: 0, min: -1000, max: 1000, step: 1 },
      offsetZ: { value: 0, min: -1000, max: 1000, step: 1 },
      noiseMapValues: {
        persistence: { value: 0.5, min: 0, max: 1, step: 0.01 },
        amplitude: { value: 1, min: 0, max: 10, step: 0.1 },
        octaves: { value: 5, min: 1, max: 8, step: 1 },
        wavelength: { value: 133, min: 1, max: 256, step: 1 },
      },
      terrainCustomization: {
        exponent: { value: 3.3, min: 1, max: 10, step: 0.05 },
        peaks: { value: 0.25, min: 0, max: 0.25, step: 0.01 },
        waterLevel: { value: 132, min: 0, max: 255, step: 1 },
        beachSize: { value: 12, min: 0, max: 255, step: 1 },
      },
      lighting: {
        worldLight: { value: 160, min: 0, max: 255, step: 1, graphical: true },
        lightPosition: { value: 225, min: 0, max: 360, step: 1, graphical: true },
        lightHeight: { value: 60, min: -90, max: 90, step: 1, graphical: true },
      },
    }
  }

  // Deterministically generate a gradient vector for a grid point
  private gradient(ix: number, iy: number): [number, number] {
    // Simple hash: combine coordinates and seed, then use PRNG
    const hash = (ix * 1836311903) ^ (iy * 2971215073) ^ this._flatConfigValues.seed
    const prng = new SeedablePRNG(hash)
    const angle = prng.next() * Math.PI * 2
    return [Math.cos(angle), Math.sin(angle)]
  }

  private dotProduct(v1: [number, number], v2: [number, number]): number {
    return v1[0] * v2[0] + v1[1] * v2[1]
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  private lerp(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b
  }

  getHeight(x: number, y: number): number {
    const {
      offsetX, offsetZ, amplitude, peaks, exponent,
      persistence, octaves, wavelength,
    } = this._flatConfigValues

    let value = 0
    let wl = wavelength
    let amp = amplitude
    const k = x + offsetX
    const j = y + offsetZ

    for (let o = 0; o < octaves; o++) {
      const x0 = Math.floor(k / wl)
      const x1 = x0 + 1
      const y0 = Math.floor(j / wl)
      const y1 = y0 + 1

      const sx = k / wl - x0
      const sy = j / wl - y0

      const g00 = this.gradient(x0, y0)
      const g10 = this.gradient(x1, y0)
      const g01 = this.gradient(x0, y1)
      const g11 = this.gradient(x1, y1)

      const dot00 = this.dotProduct(g00, [sx, sy])
      const dot10 = this.dotProduct(g10, [sx - 1, sy])
      const dot01 = this.dotProduct(g01, [sx, sy - 1])
      const dot11 = this.dotProduct(g11, [sx - 1, sy - 1])

      const tx = this.easeInOutQuad(sx)
      const ty = this.easeInOutQuad(sy)
      const nx0 = this.lerp(dot00, dot10, tx)
      const nx1 = this.lerp(dot01, dot11, tx)
      const nxy = this.lerp(nx0, nx1, ty)

      value += amp / 4 - Math.abs(nxy * amp)
      wl = Math.max(wl / 2, 1)
      amp *= persistence
    }
    // Final height value
    return Math.max(0, Math.min(254, 255 * Math.pow((value + 1) / 2 + peaks, exponent)))
  }

  isWaterTile(height: number): boolean {
    const result = height <= this._flatConfigValues.waterLevel
    return result
  }

  // Compute the color for a tile at (x, y)
  getTileColor(
    x: number,
    y: number,
  ): RGBA {
    const elevation = this.getHeight(x, y)
    const { waterLevel } = this._flatConfigValues

    // Neighboring heights for slope calculation
    const y0 = elevation
    const y1 = this.getHeight(x + 1, y)
    const y2 = this.getHeight(x, y + 1)
    const y3 = this.getHeight(x + 1, y + 1)

    // Slope direction and components
    const [slopeDirection, slopeX, slopeZ] = this.calculateSlopeDirection(y0, y1, y2, y3)

    if (elevation < waterLevel) {
      // Water color
      return this.waterColorLookup(waterLevel - elevation)
    }
    else {
      // Land color
      return this.terrainColorLookup(
        elevation,
        slopeDirection,
        slopeX,
        slopeZ,
      )
    }
  }

  private waterColorLookup(depth: number): RGBA {
    const { worldLight, lightHeight } = this._flatConfigValues
    const light1 = 3 * (lightHeight + 90) / 180 + 1
    const light2 = 5 - light1

    let lightHeightChange = (90 - lightHeight)
    lightHeightChange /= 3 - (lightHeight + 90) / 90

    const colors: RGBA = [0, 180 - depth / 2, 255 - depth / 4, 0.7]

    colors[0] = Math.max(0, colors[0] - lightHeightChange / light1 + Math.min(0, lightHeight))
    colors[1] = Math.max(0, colors[1] - lightHeightChange / 2 + Math.min(0, lightHeight))
    colors[2] = Math.max(0, colors[2] - lightHeightChange / light2 + Math.min(0, lightHeight))

    for (let i = 0; i < 3; i++) {
      colors[i] = Math.max(0, Math.min(255, colors[i] + worldLight - 255))
    }
    return colors
  }

  private terrainColorLookup(
    elevation: number,
    slopeDirection: number,
    slopeX: number,
    slopeZ: number,
  ): RGBA {
    const { waterLevel, beachSize } = this._flatConfigValues
    let colors: RGBA

    if (elevation < waterLevel + beachSize) {
      colors = [
        Math.min(elevation / 3 + 150 * 1.3, 255),
        Math.min(elevation / 3 + 110 * 1.3, 215),
        Math.min(elevation / 3 * 1.3, 105),
        1,
      ]
    }
    else if (elevation < 100) {
      colors = [elevation, elevation + 88, elevation, 1]
    }
    else if (elevation < 130) {
      colors = [elevation, elevation + 58, elevation, 1]
    }
    else if (elevation < 160) {
      colors = [elevation, Math.min(elevation + 29, 255), elevation, 1]
    }
    else if (elevation < 190) {
      colors = [elevation - 10, elevation - 10, elevation, 1]
    }
    else if (elevation < 220) {
      colors = [elevation - 40, elevation - 40, elevation - 30, 1]
    }
    else {
      colors = [
        Math.min(255, elevation + 10),
        Math.min(255, elevation + 10),
        Math.min(255, elevation + 20),
        1,
      ]
    }

    colors = this.addShading(colors, slopeDirection, slopeX, slopeZ)

    for (let i = 0; i < 3; i++) {
      colors[i] = Math.max(0, Math.min(255, colors[i] + this._flatConfigValues.worldLight - 255))
    }
    return colors
  }

  private addShading(
    colors: RGBA,
    slopeDirection: number,
    slopeX: number,
    slopeZ: number,
  ): RGBA {
    const { lightPosition, lightHeight } = this._flatConfigValues

    let lightHeightChange = (90 - lightHeight)
    lightHeightChange /= 3 - (lightHeight + 90) / 90

    const light1 = 3 * (lightHeight + 90) / 180 + 1
    const light2 = 5 - light1

    colors[0] = Math.max(0, colors[0] - lightHeightChange / light1 + Math.min(0, lightHeight))
    colors[1] = Math.max(0, colors[1] - lightHeightChange / 2 + Math.min(0, lightHeight))
    colors[2] = Math.max(0, colors[2] - lightHeightChange / light2 + Math.min(0, lightHeight))

    let diff = Math.abs(lightPosition - slopeDirection)
    diff = diff > 180 ? 360 - diff : diff

    if (slopeX === 0 && slopeZ === 0) {
      diff = -(lightHeight - 90)
    }

    for (let i = 0; i < 3; i++) {
      colors[i] = Math.min(255, Math.max(0, colors[i] - diff * Math.abs((lightHeight - 90) / 90)))
    }
    return colors
  }

  private calculateSlopeDirection(
    y0: number,
    y1: number,
    y2: number,
    y3: number,
  ): [number, number, number] {
    const slopeX0 = y1 - y0
    const slopeZ0 = y2 - y0
    const slopeX1 = y3 - y2
    const slopeZ1 = y3 - y1

    const averageSlopeX = (slopeX0 + slopeX1) / 2
    const averageSlopeZ = (slopeZ0 + slopeZ1) / 2

    let slopeDirection = Math.atan2(averageSlopeZ, averageSlopeX) * 180 / Math.PI
    slopeDirection = (slopeDirection + 360) % 360

    return [slopeDirection, averageSlopeX, averageSlopeZ]
  }
}
