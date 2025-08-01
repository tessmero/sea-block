/**
 * @file ssd-transition.ts
 *
 * Sweep-sweep-drop combo transition.
 * - Sweeps screen like start half of flat-transition,
 * - repeats the sweep with different colors,
 * - and reveals new scene with end of drop-transition.
 */

import type { ColorRepresentation } from 'three'
import { Color } from 'three'
import type { SeaBlock } from 'sea-block'
import { Transition } from './transition'

type SweepSegment = {
  t0: number
  t1: number
  color: ColorRepresentation
}

// Preset color palettes (arrays of ColorRepresentation)
const colorPalettes: Array<Array<ColorRepresentation>> = [
  ['#888c92', '#6a7a8c', '#4a5a6a', '#222428'],
  ['#8c9288', '#7d8c7a', '#5a6a4a', '#23241f'],
  ['#928c88', '#8c837a', '#6a5a4a', '#23211f'],
  ['#889292', '#6a8c8c', '#4a6a6a', '#1f2323'],
  ['#929288', '#8c8c6a', '#6a6a4a', '#23231f'],
  ['#928c88', '#8c7a6a', '#6a5a4a', '#231f1f'],
]
function pickRandomPalette(): Array<ColorRepresentation> {
  return colorPalettes[Math.floor(Math.random() * colorPalettes.length)]
}
const segmentCount = 6
const segmentDuration = 0.5
const segmentInterval = (1 - segmentDuration) / (segmentCount - 1)
function buildHideSegments(): Array<SweepSegment> {
  if (segmentCount < 2) throw new Error('Need at least 2 segments')
  const palette = pickRandomPalette()
  const firstColor: ColorRepresentation = '#808080' // gray
  const lastColor: ColorRepresentation = '#000000' // black
  const segments: Array<SweepSegment> = []
  for (let i = 0; i < segmentCount; ++i) {
    const t0 = i * segmentInterval
    const t1 = t0 + segmentDuration
    let color: ColorRepresentation
    if (i === 0) color = firstColor
    else if (i === segmentCount - 1) color = lastColor
    else color = palette[(i - 1) % palette.length]
    segments.push({ t0, t1, color })
  }
  return segments
}
const hideSegments = buildHideSegments()

type BufferedSegment = {
  transition: Transition
  isFinished: boolean
}

function buildHideTransition(context: SeaBlock, seg: SweepSegment): BufferedSegment {
  // Convert color to THREE.Color and then to array for Transition.create
  const color = new Color(seg.color)
  const transition = Transition.create('flat', context, color.toArray() as [number, number, number])
  return { transition, isFinished: false }
}

export class SsdTransition extends Transition {
  static { Transition.register('ssd', () => new SsdTransition()) }

  // assigned in create -> reset
  context!: SeaBlock
  ssdHide!: Array<BufferedSegment> // corresponds with hideSegments
  ssdShow!: Array<Transition>

  protected reset(context): void {
    this.context = context
    this.ssdHide = hideSegments.map(seg => buildHideTransition(context, seg))
  }

  public _hide(t0: number, t1: number): void {
    for (const [i, seg] of hideSegments.entries()) {
      const buffered = this.ssdHide[i]
      if (buffered.isFinished) {
        continue
      }

      if (t1 < seg.t0) {
        continue // hasn't started yet
      }

      if (t0 < seg.t1 || t1 > seg.t0) {
        const t0InSegment = Math.max(0, Math.min(1, (t0 - seg.t0) / (seg.t1 - seg.t0)))
        const t1InSegment = Math.max(0, Math.min(1, (t1 - seg.t0) / (seg.t1 - seg.t0)))
        buffered.transition._hide(t0InSegment, t1InSegment)
        // console.log(`hide subtransition with index ${i}, (${t0InSegment.toFixed(2)}-${t1InSegment.toFixed(2)})`)
      }

      if (t0 > seg.t1) {
        buffered.isFinished = true
        // console.log(`finished segment ${i} at ${t0}`)
      }
    }
  }

  public cleanupHide(): void {
    // console.log('ssd cleanup hide black')

    const { ctx, w, h } = this.layeredViewport
    ctx.fillStyle = 'black' // last hide segment color
    ctx.fillRect(0, 0, w, h)

    // make sure terrain is offscreen
    this._initSsdShow()
    this.ssdShow[1].cleanupHide()
  }

  public cleanupShow(): void {
    this._initSsdShow()
    this.ssdShow[0].cleanupShow() // clear front layer
    this.ssdShow[1].cleanupShow() // unwarp terrain
  }

  private _initSsdShow() {
    if (!this.ssdShow) {
      this.ssdShow = [
        Transition.create('flat', this.context),
        Transition.create('drop', this.context),
      ]
    }
  }

  public _show(t0: number, t1: number): void {
    this._initSsdShow()
    const [first, second] = this.ssdShow
    if (t0 < 0.5) {
      first._show(Math.max(0, t0 * 2), Math.min(1, t1 * 2))
    }
    if (t1 > 0.5) {
      second._show(Math.max(0, (t0 - 0.5) * 2), Math.min(1, (t1 - 0.5) * 2))
    }
  }
}
