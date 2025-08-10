/**
 * @file transition.ts
 *
 * Base class for transition sequence where the scene is
 * hidden somehow. Then a new scene is revealed somehow.
 *
 * Some transitions involve coordinating both layers (2d and 3d).
 */

type RGB = [number, number, number]
import type { TileGroup } from 'core/groups/tile-group'
import type { LayeredViewport } from 'gfx/layered-viewport'
import type { TransitionName } from 'imp-names'
import type { SeaBlock } from 'sea-block'
import { Color } from 'three'
import type { SweepSegment } from './imp/flat-transition-segments'
import type { FlatTransition } from './imp/flat-transition'
import type { Step } from 'gfx/3d/tile-render-pipeline/pipeline'

const totalDuration = 1500 // ms

export function randomTransition(context: SeaBlock): Transition {
  // const name = randChoice(TRANSITION.NAMES)

  // do sweep-sweep-drop combo transition just for launch
  const name = Transition.isFirstUncover ? 'ssd' : 'flat'

  // const name = 'flat'
  return Transition.create(name, context)
}

export abstract class Transition {
  static isFirstUncover = true

  // optional extra step before rendering tile (tile-group-gfx-helper.ts)
  public getExtraPipelineStep(): Step | null { return null }
  public doesAllowMidTransitionReset = true

  private elapsed = 0 // ms
  public didFinishCover = false
  public didFinishUncover = false

  protected layeredViewport!: LayeredViewport // assigned in create
  protected terrain!: TileGroup // assigned in create
  protected abstract reset(context: SeaBlock): void // called in create

  // t0 and t1 are fractions of segment in range (0-1)
  public abstract _hide(t0: number, t1: number): void
  public abstract _show(t0: number, t1: number): void

  // completely clear/fill front layer
  public cleanupHide(): void {
    // console.log('base cleanup hide black')
    const { ctx, w, h } = this.layeredViewport
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, w, h)
  }

  public cleanupShow(): void {
    // console.log('base cleanup show')
    const { ctx, w, h } = this.layeredViewport
    ctx.clearRect(0, 0, w, h)
  }

  update(dt: number) {
    // describe elapsed time range as fraction of animation
    const start = this.elapsed / totalDuration

    // if (this.didFinishCover && isFirstUncover) {
    if (Transition.isFirstUncover) {
      this.elapsed += 0.5 * dt // slow down first uncover
    }
    else {
      this.elapsed += dt
    }

    const end = this.elapsed / totalDuration

    if (!this.didFinishCover && end >= 0.5) {
      // will just finish covering this update
      this.elapsed = totalDuration / 2
      this.cleanupHide()
      this.didFinishCover = true
      return
    }

    if (end >= 1) {
      // signal to end transition
      this.cleanupShow()
      this.didFinishUncover = true
      Transition.isFirstUncover = false
      return
    }

    if (end <= 0.5) {
      // cover fraction of first half of duration
      const t0 = Math.max(0, start * 2)
      const t1 = Math.min(1, end * 2)
      this._hide(t0, t1)
    }
    else {
      // uncover fraction of second half of duration
      const t0 = Math.max(0, start * 2 - 1)
      const t1 = Math.min(1, end * 2 - 1)
      this._show(t0, t1)
    }
  }

  // static registry pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _registry: Record<TransitionName, () => Transition> = {} as any

  protected constructor() {}

  static register(name: TransitionName, factory: () => Transition): void {
    if (name in this._registry) {
      throw new Error(`Transition already registered: '${name}'`)
    }
    this._registry[name] = factory
  }

  static create(name: TransitionName, context: SeaBlock, seg?: SweepSegment): Transition {
    const factory = this._registry[name]
    const instance = factory()

    // Transition
    // post-construction setup
    const { layeredViewport, terrain } = context
    instance.layeredViewport = layeredViewport
    instance.terrain = terrain

    if (seg) {
      const { colors, tiling } = seg
      const flatInstance = instance as FlatTransition

      const hideColors = colors.map(color => new Color(color).toArray() as RGB) as [RGB, RGB]
      flatInstance.hideColors = hideColors

      if (tiling) {
        // console.log(`transitioncreate override tiling: ${tiling}`)
        flatInstance.tiling = tiling
      }
    }
    instance.reset(context)

    return instance
  }
}
