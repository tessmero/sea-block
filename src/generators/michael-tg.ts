/**
 * @file michael-tg.ts
 *
 * Terrain generator implementation adapted from
 * Michael2-3B/Procedural-Perlin-Terrain.
 */
import { Color } from 'three'
import { michaelConfig } from '../configs/michael-config'
import { SeedablePRNG } from '../util/rng'
import type { GeneratedTile } from './terrain-generator'
import { TerrainGenerator } from './terrain-generator'

type RGB = [number, number, number]

export class MichaelTG extends TerrainGenerator {
  static { TerrainGenerator.register('Michael2-3B', () => new MichaelTG()) }

  label = 'Michael2-3B/Procedural-Perlin-Terrain'
  url = 'https://github.com/Michael2-3B/Procedural-Perlin-Terrain'
  config = michaelConfig
  style = { sides: { lightness: -0.1 } }

  public getTile(rawX: number, rawZ: number): GeneratedTile {
    const x = rawX / this.xzScale
    const z = rawZ / this.xzScale

    const rawHeight = this.getHeight(x, z)
    const { waterLevel, yScale } = this.config.flatConfig

    const scaledHeight = (rawHeight - waterLevel) * yScale + waterLevel

    return {
      height: Math.max(scaledHeight, waterLevel),
      color: this.getTileColor(x, z),
      isWater: rawHeight <= waterLevel,
      isFlora: false,
    }
  }

  // Deterministically generate a gradient vector for a grid point
  private gradient(ix: number, iy: number): [number, number] {
    // Simple hash: combine coordinates and seed, then use PRNG
    const hash = ix * 1836311903 ^ iy * 2971215073 ^ this.config.flatConfig.seed
    const prng = new SeedablePRNG(hash)
    const angle = prng.next() * Math.PI * 2
    return [
      Math.cos(angle),
      Math.sin(angle),
    ]
  }

  private dotProduct(v1: [number, number], v2: [number, number]): number {
    return v1[0] * v2[0] + v1[1] * v2[1]
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t
  }

  private lerp(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b
  }

  getHeight(x: number, y: number): number {
    const {
      offsetX, offsetZ, amplitude, peaks, exponent,
      persistence, octaves, wavelength,
    } = this.config.flatConfig

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

      const dot00 = this.dotProduct(g00, [sx, sy],
      )
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
    return Math.max(0, Math.min(254,
      255 * Math.pow(
        (value + 1) / 2 + peaks,
        exponent,
      ),
    ))
  }

  // Compute the color for a tile at (x, y)
  getTileColor(
    x: number,
    y: number,
  ): Color {
    const elevation = this.getHeight(x, y)
    const { waterLevel } = this.config.flatConfig

    // Neighboring heights for slope calculation
    const y0 = elevation
    const y1 = this.getHeight(x + 1, y)
    const y2 = this.getHeight(x, y + 1)
    const y3 = this.getHeight(x + 1, y + 1)

    // Slope direction and components
    const [
      slopeDirection,
      slopeX,
      slopeZ,
    ] = this.calculateSlopeDirection(y0, y1, y2, y3)

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

  protected waterColorLookup(depth: number): Color {
    const { worldLight, lightHeight } = this.config.flatConfig
    const light1 = 3 * (lightHeight + 90) / 180 + 1
    const light2 = 5 - light1

    let lightHeightChange = 90 - lightHeight
    lightHeightChange /= 3 - (lightHeight + 90) / 90

    const rgb: RGB = [
      0,
      180 - depth / 2,
      255 - depth / 4,
      // 0.7,
    ]

    rgb[0] = Math.max(
      0,
      rgb[0] - lightHeightChange / light1 + Math.min(
        0,
        lightHeight,
      ),
    )
    rgb[1] = Math.max(
      0,
      rgb[1] - lightHeightChange / 2 + Math.min(
        0,
        lightHeight,
      ),
    )
    rgb[2] = Math.max(
      0,
      rgb[2] - lightHeightChange / light2 + Math.min(
        0,
        lightHeight,
      ),
    )

    for (let i = 0; i < 3; i++) {
      rgb[i] = Math.max(
        0,
        Math.min(
          255,
          rgb[i] + worldLight - 255,
        ),
      )
    }
    return new Color(...rgb.map(v => v / 255))
  }

  private terrainColorLookup(
    elevation: number,
    slopeDirection: number,
    slopeX: number,
    slopeZ: number,
  ): Color {
    const { waterLevel, beachSize, worldLight } = this.config.flatConfig
    let rgb: RGB

    if (elevation < waterLevel + beachSize) {
      rgb = [
        Math.min(
          elevation / 3 + 150 * 1.3,
          255,
        ),
        Math.min(
          elevation / 3 + 110 * 1.3,
          215,
        ),
        Math.min(
          elevation / 3 * 1.3,
          105,
        ),
      ]
    }
    else if (elevation < 100) {
      rgb = [
        elevation,
        elevation + 88,
        elevation,
      ]
    }
    else if (elevation < 130) {
      rgb = [
        elevation,
        elevation + 58,
        elevation,
      ]
    }
    else if (elevation < 160) {
      rgb = [
        elevation,
        Math.min(
          elevation + 29,
          255,
        ),
        elevation,
      ]
    }
    else if (elevation < 190) {
      rgb = [
        elevation - 10,
        elevation - 10,
        elevation,
      ]
    }
    else if (elevation < 220) {
      rgb = [
        elevation - 40,
        elevation - 40,
        elevation - 30,
      ]
    }
    else {
      rgb = [
        Math.min(255, elevation + 10),
        Math.min(255, elevation + 10),
        Math.min(255, elevation + 20),
      ]
    }

    rgb = this.addShading(rgb, slopeDirection, slopeX, slopeZ)

    for (let i = 0; i < 3; i++) {
      rgb[i] = Math.max(0, Math.min(255,
        rgb[i] + worldLight - 255,
      ))
    }
    return new Color(...rgb.map(v => v / 255))
  }

  private addShading(
    rgb: RGB,
    slopeDirection: number,
    slopeX: number,
    slopeZ: number,
  ): RGB {
    const { lightPosition, lightHeight } = this.config.flatConfig

    let lightHeightChange = 90 - lightHeight
    lightHeightChange /= 3 - (lightHeight + 90) / 90

    const light1 = 3 * (lightHeight + 90) / 180 + 1
    const light2 = 5 - light1

    rgb[0] = Math.max(
      0,
      rgb[0] - lightHeightChange / light1 + Math.min(
        0,
        lightHeight,
      ),
    )
    rgb[1] = Math.max(
      0,
      rgb[1] - lightHeightChange / 2 + Math.min(
        0,
        lightHeight,
      ),
    )
    rgb[2] = Math.max(
      0,
      rgb[2] - lightHeightChange / light2 + Math.min(
        0,
        lightHeight,
      ),
    )

    let diff = Math.abs(lightPosition - slopeDirection)
    diff = diff > 180
      ? 360 - diff
      : diff

    if (slopeX === 0 && slopeZ === 0) {
      diff = -(lightHeight - 90)
    }

    for (let i = 0; i < 3; i++) {
      rgb[i] = Math.min(
        255,
        Math.max(
          0,
          rgb[i] - diff * Math.abs((lightHeight - 90) / 90),
        ),
      )
    }
    return rgb
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

    let slopeDirection = Math.atan2(
      averageSlopeZ,
      averageSlopeX,
    ) * 180 / Math.PI
    slopeDirection = (slopeDirection + 360) % 360

    return [
      slopeDirection,
      averageSlopeX,
      averageSlopeZ,
    ]
  }
}
