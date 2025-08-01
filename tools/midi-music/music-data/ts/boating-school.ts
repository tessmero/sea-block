/**
 * @file boating-school.ts
 *
 * One song from boating-school demo.
 */

import { Song } from '../../ts-to-midi'

const _ = 'rest'
const s = 'sustain'

const _DUR = 0.10

export default {

  voices: [
    {
      // melody
      // wave: 'square',
      volume: 0.5,
      duration: _DUR, // sixteenth notes
      freq: 'A4', // 0 note
      // env: 'bachBass',
      instrument: 12, // 12 marimba
    },
    {
      // bass
      // wave: 'square',
      volume: 0.5,
      duration: _DUR, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 12, // 12 marimba
    },
    {
      // bass
      // wave: 'square',
      volume: 0.3,
      duration: _DUR, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 12, // 12 marimba
    },
    {
      // bass
      // wave: 'square',
      volume: 0.3,
      duration: _DUR, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 12, // 12 marimba
    },
    {
      // bass
      // wave: 'square',
      volume: 0.5,
      duration: _DUR, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 11, // 11 vibraphone
    },
  ],

  score: [
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-4, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-6, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-8, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-9, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [_, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [_, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [_, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [_, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [8, s, s, s, 8, s, 5, s, 8, s, 5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-4, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [8, s, s, s, 8, s, 5, s, 8, s, 5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-6, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [8, s, s, s, 8, s, 5, s, 8, s, 5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-8, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [8, s, s, s, 8, s, 5, s, 8, s, 5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-9, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [8, s, 5, s, 8, s, 5, s, 8, s, 5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-9, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [8, s, 5, s, 8, s, 5, s, 8, s, 5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-9, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [8, s, 5, s, 8, s, 5, s, 8, s, 5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-9, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [8, s, s, s, _, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, 8, s, s, s, 8, s, s, s],
      [_, s, s, s, 3, s, s, s, 3, s, s, s],
      [-9, s, s, s, 0, s, s, s, 0, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s],
    ],
  ],
} as const satisfies Song
