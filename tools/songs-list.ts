/**
 * @file songs-list.ts
 *
 * List of midi songs to generate with build-songs.ts.
 * Each song will be saved as an .ogg file in public/music.
 *
 * Classical music midis: https://www.kunstderfuge.com.
 * Trap midis: https://old.reddit.com/r/trapproduction/comments/grh7qc/100_royalty_free_midi_kit_w_40_melodies_chord/
 *
 * Music scores are tracked in this repository in music-data.
 */

import { SpessaSynthProcessor, SpessaSynthSequencer } from 'spessasynth_core'
import { SOUND_FONTS } from './sound-fonts'

export type SongParams = {
  src: string // path to (.mid) or (.ts) song data
  adjust?: Adjuster // transpose, change instruments, add effects
  soundFount?: keyof typeof SOUND_FONTS // override default sound font
  skip?: number // (seconds) cut from start
  cutoff?: number // (seconds) cut from end
}
type Adjuster = (params: { synth: SpessaSynthProcessor, seq: SpessaSynthSequencer }) => void

// const tsSrc = (name: string) => `./music-data/ts/${name}.ts`
const classicalMidi = (name: string) => `./music-data/midi/www-kunstderfuge-com/${name}.mid`
// const trapMidi = (name: string) => `./music-data/midi/mullen-solace/${name}.mid`

export const SONGS_TO_BUILD: Record<string, SongParams> = {

  // Albeniz / Granada
  albeniz: {
    src: classicalMidi('granada_(c)yogore'),
    adjust: ({ synth, seq }) => {
      seq.playbackRate = 0.5 // slow down
      synth.programChange(0, 34) // 34 picked bass
      synth.programChange(1, 34) // 34 picked bass
      synth.programChange(2, 34) // 34 picked bass
      synth.midiAudioChannels[0].transposeChannel(-12) // pitch down
      synth.midiAudioChannels[1].transposeChannel(-12) // pitch down
    },
    skip: 69.5,
    cutoff: 88.8,
  },

  // // Mozart / Andante cantabile con espressione
  // 'mozart': {
  //   src: classicalMidi('mozart'),
  //   adjust: ({ synth }) => {
  //     // synth.programChange(0, 33) // 33 fingered bass
  //     synth.programChange(0, 26) // 26 jazz guitar
  //     synth.controllerChange(0, 1, 50) // add 50% vibrato
  //     synth.transposeAllChannels(4) // pitch up
  //   },
  // },

  // // Couperin / Les Baricades Mistérieuses
  // 'couperin': {
  //   src: classicalMidi('couperin'),
  //   adjust: ({ synth }) => {
  //     // synth.programChange(0, 33) // 33 fingered bass
  //     synth.programChange(0, 53) // 53 ooh vocal
  //     synth.transposeAllChannels(4) // pitch up
  //   },
  //   // cutoff: 40, // end early
  // },

  // // Satie / Gymnopédie 1
  // 'satie': {
  //   src: classicalMidi('satie'),
  //   adjust: ({ synth, seq }) => {
  //     seq.playbackRate = 2 // speed up
  //     synth.programChange(0, 10) // 10 music box
  //     synth.transposeAllChannels(12) // pitch up
  //   },
  // },

  // // Debussy / Arabesque in C sharp major
  // 'debussy': {
  //   src: classicalMidi('debussy'),
  //   adjust: ({ synth }) => {
  //     // seq.playbackRate = .6 // slow down
  //     synth.programChange(0, 10) // 10 music box
  //     synth.transposeAllChannels(9) // pitch up
  //   },
  //   // cutoff: 79, // end early
  // },

  // 'm-figment': {
  //   src: trapMidi('M. Figment - 162 BPM'),
  //   adjust: ({ synth }) => {
  //     synth.programChange(0, 29) // 29 overdrive guitar
  //     // synth.controllerChange(0, 1, 50) // add 50% vibrato
  //     // synth.transposeAllChannels(4) // pitch up
  //   },
  // },

  // // songs from demos on tessmero.github.io
  // 'wheely': { src: tsSrc('wheely') },
  // 'chess': { src: tsSrc('chess') },
  // 'orbital-launch': { src: tsSrc('orbital-launch') },
  // 'avalanche': { src: tsSrc('avalanche') },
  // 'fight-cub': { src: tsSrc('fight-cub') },
  // 'sketch-ball': { src: tsSrc('sketch-ball') },
  // 'space-quest': { src: tsSrc('space-quest') },
  // 'cube-dance': { src: tsSrc('cube-dance') },
  // 'rail-layer': { src: tsSrc('rail-layer') },
  // 'boating-school': { src: tsSrc('boating-school') },
  // 'grove-tender': { src: tsSrc('grove-tender') },

}
