/**
 * @file sm-update.ts
 *
 * Start menu update function (main loop).
 */

import { Howler } from 'howler'
import type { GameUpdateContext } from 'games/game'
import { pickSegment, smSequence, toggleElements } from './sm-sequence'
import { playNextTrack, START_MENU_PLAYLIST } from 'audio/song-playlist'
import { ivyUpdate } from './sm-ivy/ivy-update'
import { ivyDraw } from './sm-ivy/ivy-draw'
import { ivySetup } from './sm-ivy/ivy-setup'
import { wasdInputState } from 'guis/elements/wasd-buttons'

let elapsed = 0
let currentSegment = -1
let didStartMusic = false
let didStartIvy = false

export function smUpdate(context: GameUpdateContext): void {
  const { seaBlock, dt } = context

  // navigate gui like gamepad if user hits arrows or wasd
  for (const button in wasdInputState) {
    if (wasdInputState[button]) {
      seaBlock.isUsingGamepad = true
    }
  }

  // pick current segment
  elapsed += dt
  const i = pickSegment(elapsed)
  if (i !== currentSegment) {
    // just started or switched segment
    // console.log(`switch from smsegment ${currentSegment} to ${i}`)
    currentSegment = i
    toggleElements(currentSegment)
    seaBlock.layeredViewport.handleResize(seaBlock)
  }

  const { triggers } = smSequence[currentSegment]

  if (triggers?.includes('music') && !didStartMusic) {
    playNextTrack(START_MENU_PLAYLIST)
    if (Howler.ctx.state === 'running') {
      didStartMusic = true
    }
  }

  if (triggers?.includes('ivy')) {
    if (!didStartIvy) {
      didStartIvy = true
      ivySetup()
    }

    ivyUpdate(dt)
    ivyDraw(context)
  }
}
