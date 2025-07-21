/**
 * @file songs-list.ts
 *
 * Specifications for songs that will be built into
 * .ogg files in public/music.
 *
 * Music scores are tracked in this repository under
 * music-data/midi and music-data/tessmero.
 */

import { SpessaSynthProcessor, SpessaSynthSequencer } from 'spessasynth_core'
import { SOUND_FONTS } from './sound-fonts'

export type SongParams = {
  src: string // path to (.mid) or (.ts) song data
  adjust?: Adjuster // transpose, change instruments, add effects
  soundFount?: keyof typeof SOUND_FONTS // override default sound font
  cutoff?: number // (seconds) limit song length
}
type Adjuster = (params: { synth: SpessaSynthProcessor, seq: SpessaSynthSequencer }) => void

const tsSrc = (name: string) => `./music-data/ts/${name}.ts`
const midiSrc = (name: string) => `./music-data/midi/${name}.mid`

export const SONGS_TO_BUILD: Record<string, SongParams> = {

  // songs from demos on tessmero.github.io
  'wheely': { src: tsSrc('wheely') },
  'chess': { src: tsSrc('chess') },
  'orbital-launch': { src: tsSrc('orbital-launch') },
  'avalanche': { src: tsSrc('avalanche') },
  'fight-cub': { src: tsSrc('fight-cub') },
  'sketch-ball': { src: tsSrc('sketch-ball') },
  'space-quest': { src: tsSrc('space-quest') },
  'cube-dance': { src: tsSrc('cube-dance') },
  'rail-layer': { src: tsSrc('rail-layer') },
  'boating-school': { src: tsSrc('boating-school') },
  'grove-tender': { src: tsSrc('grove-tender') },

  // Mozart / Andante cantabile con espressione
  'mozart': {
    src: midiSrc('mozart'),
    adjust: ({ synth }) => {
      // synth.programChange(0, 33) // 33 fingered bass
      synth.programChange(0, 26) // 26 jazz guitar
      synth.controllerChange(0, 1, 50) // add 50% vibrato
      synth.transposeAllChannels(4) // pitch up
    },
  },

  // Couperin / Les Baricades Mistérieuses
  'couperin': {
    src: midiSrc('couperin'),
    adjust: ({ synth }) => {
      // synth.programChange(0, 33) // 33 fingered bass
      synth.programChange(0, 53) // 53 ooh vocal
      synth.transposeAllChannels(4) // pitch up
    },
    // cutoff: 40, // end early
  },

  // Satie / Gymnopédie 1
  'satie': {
    src: midiSrc('satie'),
    adjust: ({ synth, seq }) => {
      seq.playbackRate = 2 // speed up
      synth.programChange(0, 10) // 10 music box
      synth.transposeAllChannels(12) // pitch up
    },
  },

  // Debussy / Arabesque in C sharp major
  'debussy': {
    src: midiSrc('debussy'),
    adjust: ({ synth }) => {
      // seq.playbackRate = .6 // slow down
      synth.programChange(0, 10) // 10 music box
      synth.transposeAllChannels(9) // pitch up
    },
    // cutoff: 79, // end early
  },

}
