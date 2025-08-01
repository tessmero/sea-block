/**
 * @file orbital-launch.ts
 *
 * Simple song from orbital-launch demo.
 */
import { Song } from '../../ts-to-midi'

const _ = 'rest'
const s = 'sustain'

export default {

  voices: [
    {
      // melody
      // wave: 'square',
      volume: 0.1,
      duration: 0.12, // sixteenth notes
      freq: 'A4', // 0 note
      // env: 'bachBass',
      instrument: 10, // 10 music box
    },
    {
      // bass
      // wave: 'square',
      volume: 0.1,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 53, // 53 voice oohs
    },
    {
      // bass
      // wave: 'square',
      volume: 0.1,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 53, // 53 voice oohs
    },
    {
      // bass
      // wave: 'square',
      volume: 0.1,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 53, // 53 voice oohs
    },
  ],

  score: [
    [
      [10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, 0, 3, 5, 8, 0, 3, 5, 10, 0, 3, 7, 10, 0, 3, 7],
      [5, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, 0, 3, 5, 8, 0, 3, 5, 10, 0, 3, 7, 10, 0, 3, 7],
      [5, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, s, 7, s, 5, s, 3, s, 10, s, 7, s, 5, s, 3, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, s, 7, s, 5, s, 3, s, 10, s, 7, s, 5, s, 3, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, s, 7, s, 5, s, 3, s, 0, s, 3, s, 7, s, 10, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, s, 8, s, 7, s, 5, s, -2, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, -2, 5, 7, 10, s, 7, s, 5, s, 3, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, -2, 5, 7, 10, s, 7, s, 5, s, 3, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, -2, 5, 7, 10, -2, 5, 7, 10, s, s, 5, s, s, 10, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, -2, 5, 7, 10, s, 7, s, 5, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, 0, 3, 5, 8, 0, 3, 5, 10, 0, 3, 7, 10, 0, 3, 7],
      [5, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, 0, 3, 5, 8, 0, 3, 5, 10, 0, 3, 7, 10, 0, 3, 7],
      [5, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
  ],
} satisfies Song
