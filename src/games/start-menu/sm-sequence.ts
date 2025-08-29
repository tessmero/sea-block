/**
 * @file sm-sequence.ts
 *
 * Start menu sequence.
 */

import type { GuiElement } from 'guis/gui'
import { smBanner, smSettingsBtn, smStartBtn, smStory, smWarning } from './sm-elements'
import type { SmLayoutKey } from 'guis/keys/sm-layout-keys'

type SmElem = GuiElement<SmLayoutKey>

type Segment = {
  duration: number
  elements: Array<SmElem>
  triggers?: Array<'music' | 'ivy'>
}

// sequence of labels to show before main menu
export const smSequence: Array<Segment> = [
  {
    // nothing
    duration: 1000,
    elements: [],
  },
  {
    // flashing lights warning
    duration: 2000,
    elements: [smWarning],
  },
  {
    // story
    duration: 2000,
    elements: [smStory],
  },
  {
    // start music
    duration: 1000,
    triggers: ['music'],
    elements: [],
  },
  {
    // main menu
    duration: Infinity,
    triggers: ['ivy'],
    elements: [
      smBanner,
      smStartBtn,
      smSettingsBtn,
    ],

  },
]

export function pickSegment(elapsed: number): number {
  let t = elapsed
  for (const [i, seg] of smSequence.entries()) {
    t -= seg.duration
    if (t < 0) {
      return i
    }
  }
  return smSequence.length - 1 // default to last segment
}

export function toggleElements(segment: number) {
  for (const [i, { elements }] of smSequence.entries()) {
    const isVisible = i === segment
    for (const { display } of elements) {
      display.isVisible = isVisible
      display.needsUpdate = true
    }
  }
}
