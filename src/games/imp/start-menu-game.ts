/**
 * @file start-menu-game.ts
 *
 * Game active after clicking launch on splash screen.
 */

import { Howler } from 'howler'
import { playNextTrack, START_MENU_PLAYLIST } from 'audio/song-playlist'
import type { GameUpdateContext } from 'games/game'
import { Game } from 'games/game'
import type { SeaBlock } from 'sea-block'
import { smSequenceElems } from 'guis/imp/start-menu-gui'

type Segment = {
  duration: number
}

// sequence of labels to show before main menu
const sequence: Array<Segment> = [
  {
    // nothing
    duration: 1000,
  },
  {
    // flashing lights warning
    duration: 2000,
  },
  {
    // story
    duration: 2000,
  },
  {
    // start music
    duration: 1000,
  },
  {
    // main menu
    duration: Infinity,
  },
]

function pickSegment(elapsed: number): number {
  let t = elapsed
  for (const [i, seg] of sequence.entries()) {
    t -= seg.duration
    if (t < 0) {
      return i
    }
  }
  return sequence.length - 1 // default to last segment
}

function toggleElements(segment: number) {
  for (const [i, elems] of smSequenceElems.entries()) {
    const isVisible = i === segment
    for (const { display } of elems) {
      display.isVisible = isVisible
      display.needsUpdate = true
    }
  }
}

let elapsed = 0
let currentSegment = -1
let didStartMusic = false

export class StartMenuGame extends Game {
  public reset(_context: SeaBlock): void {
    // do nothing
  }

  public update(context: GameUpdateContext): void {
    const { seaBlock, dt } = context

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

    if (currentSegment >= 3 && !didStartMusic) {
      playNextTrack(START_MENU_PLAYLIST)
      if (Howler.ctx.state === 'running') {
        didStartMusic = true
      }
    }
  }

  static {
    Game.register('start-menu', {
      factory: () => new StartMenuGame(),
      guiName: 'start-menu',
      elements: [],
    })
  }

  public doesAllow3DRender(): boolean {
    return false
  }
}
