/**
 * @file flat-transition-segments.ts
 *
 * Used in ssd-transition to build series of sweeps with shifting colors.
 */

import { type ColorRepresentation } from 'three'

export type SweepSegment = {
  t0: number
  t1: number
  color: ColorRepresentation
}
const segmentCount = 6
const segmentDuration = 0.5
const segmentInterval = (1 - segmentDuration) / (segmentCount - 1)
export function buildHideSegments(): Array<SweepSegment> {
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

// going from black to sky color
export function buildShowSegments(): Array<SweepSegment> {
  return [
    {
      t0: 0,
      t1: 0.2,
      color: 'black',
    },
    {
      t0: 0.05,
      t1: 0.25,
      color: '0x5599aa',
    },
    {
      t0: 0.1,
      t1: 0.3,
      color: '0xaaccff', // sky background
    },
  ]
}

// palletss going from gray to black
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
