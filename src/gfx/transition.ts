/**
 * @file transition.ts
 *
 * Base class for transition sequence where the scene is
 * hidden somehow. Then a new scene is revealed somehow.
 *
 * Some transitions involve coordinating both layers (2d and 3d).
 */

import { type TransitionName } from '../imp-names'
import type { LayeredViewport } from './layered-viewport'

const totalDuration = 1500 // ms

export function randomTransition(layeredViewport: LayeredViewport): Transition {
  // const name = randChoice(TRANSITION_NAMES)
  const name = 'flat'
  return Transition.create(name, layeredViewport)
}

export abstract class Transition {
  private elapsed = 0 // ms
  public didFinishCover = false
  public didFinishUncover = false

  protected layeredViewport!: LayeredViewport // assigned in create
  protected abstract reset(): void // called in create

  // t0 and t1 are fractions of segment in range (0-1)
  protected abstract _cover(t0: number, t1: number): void
  protected abstract _uncover(t0: number, t1: number): void

  // completely hide/show scene
  public abstract cleanupCover(): void
  public abstract cleanupUncover(): void

  update(dt: number) {
    // describe elapsed time range as fraction of animation
    const start = this.elapsed / totalDuration
    this.elapsed += dt
    const end = this.elapsed / totalDuration

    if (!this.didFinishCover && end >= 0.5) {
      // will just finish covering this update
      this.elapsed = totalDuration / 2
      this.cleanupCover()
      this.didFinishCover = true
      return
    }

    if (end >= 1) {
      // signal to end transition
      this.cleanupUncover()
      this.didFinishUncover = true
      return
    }

    if (end <= 0.5) {
      // cover fraction of first half of duration
      const t0 = Math.max(0, start * 2)
      const t1 = Math.min(1, end * 2)
      this._cover(t0, t1)
    }
    else {
      // uncover fraction of second half of duration
      const t0 = Math.max(0, start * 2 - 1)
      const t1 = Math.min(1, end * 2 - 1)
      this._uncover(t0, t1)
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

  static create(name: TransitionName, layeredViewport: LayeredViewport): Transition {
    const factory = this._registry[name]
    const instance = factory()

    // Transition
    // post-construction setup
    instance.layeredViewport = layeredViewport
    instance.reset()

    return instance
  }
}
