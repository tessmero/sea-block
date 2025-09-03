/**
 * @file sea-block-intro.ts
 *
 * Song that starts after clicking launch.
 */

import { Song } from '../../ts-to-midi'
const _ = 'rest'
const s = 'sustain'

const G3 = -14
const B3 = -10
// const C4 = -9
const D4 = -7
const G4 = -2
const A4 = 0
// const A4s = 1 // A#4 / Bb4
const B4 = 2
const C5 = 3
// const C5s = 4 // C#5 / Db5
const D5 = 5
// const D5s = 6 // D#5 / Eb5
const E5 = 7
// const F5 = 8
// const F5s = 9 // F#5 / Gb5
// const G5 = 10
// const G5s = 11 // G#5 / Ab5
// const A5 = 12

export default {

  voices: [
    {
      // melody
      // wave: 'square',
      volume: 0.1,
      duration: 0.12, // sixteenth notes
      freq: 'A4', // 0 note
      instrument: 53, // // 53 ooh vocal
    },
    {
      // melody
      // wave: 'square',
      volume: 0.1,
      duration: 0.12, // sixteenth notes
      freq: 'A4', // 0 note
      instrument: 35, // 35 fretless bass
    },
    {
      // melody
      // wave: 'square',
      volume: 0.1,
      duration: 0.12, // sixteenth notes
      freq: 'A4', // 0 note
      instrument: 35, // 35 fretless bass
    },
    {
      // melody
      // wave: 'square',
      volume: 0.1,
      duration: 0.12, // sixteenth notes
      freq: 'A4', // 0 note
      instrument: 35, // 35 fretless bass
    },
  ],

  score: [
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [D4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [B3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [G3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [D4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [B3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [G3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s],
      [A4, _, _, _, A4, _, _, _],
    ],
    [
      [A4, s, B4, s, C5, s, D5, s, E5, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [A4, _, _, _, A4, _, _, _, A4, _, _, _, A4, _, _, _],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, G4, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [A4, _, _, _, A4, _, _, _, A4, _, _, _, A4, _, _, _],
    ],
    [
      [A4, s, B4, s, C5, s, E5, s, D5, s, s, s, s, s, C5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [A4, _, _, _, A4, _, _, _, A4, _, _, _, A4, _, _, _],
    ],
    [
      [B4, s, s, s, s, s, A4, s, G4, s, s, s, s, s, A4, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [A4, _, _, _, A4, _, _, _, A4, _, _, _, A4, _, _, _],
    ],
    [
      [B4, s, s, s, s, s, G4, s, A4, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [A4, _, _, _, A4, _, _, _, A4, _, _, _, A4, _, _, _],
    ],
  ],
} satisfies Song
