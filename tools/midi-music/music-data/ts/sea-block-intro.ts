/**
 * @file sea-block-intro.ts
 *
 * Song that starts after clicking launch.
 */

import { Song } from '../../ts-to-midi'
const _ = 'rest'
// const s = 'sustain'

const C4 = -9
// const G4 = -1
const A4 = 0
// const A4s = 1 // A#4 / Bb4
// const B4 = 2
const C5 = 3
// const C5s = 4 // C#5 / Db5
const D5 = 5
// const D5s = 6 // D#5 / Eb5
const E5 = 7
const F5 = 8
// const F5s = 9 // F#5 / Gb5
const G5 = 10
// const G5s = 11 // G#5 / Ab5
const A5 = 12

export default {

  voices: [
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
      [A5, _, F5, _, C5, _, A5, _, G5, _, E5, _, D5, _, C5, _],
      [A4, _, _, _, _, _, _, _, C4, _, _, _, _, _, _, _],
    ],
    [
      [A5, _, F5, _, C5, _, A5, _, G5, _, _, _, _, _, _, _],
      [A4, _, _, _, _, _, _, _, C4, _, _, _, _, _, _, _],
    ],
    [
      [A5, _, F5, _, C5, _, A5, _, G5, _, E5, _, D5, _, C5, _],
      [A4, _, _, _, _, _, _, _, C4, _, _, _, _, _, _, _],
    ],
    [
      [C5, E5, F5, G5, C5, E5, F5, G5],
      [A4, _, _, _, A4, _, _, _],
    ],
    [
      [A5, _, F5, _, C5, _, A5, _, G5, _, E5, _, D5, _, C5, _],
      [A4, _, _, _, _, _, _, _, C4, _, _, _, _, _, _, _],
    ],
  ],
} satisfies Song
