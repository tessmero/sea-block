/**
 * @file avalanche.ts
 *
 * Avalanche song data.
 */
import { Song } from '../../ts-to-midi'

const _ = 'rest'
const s = 'sustain'

export default {
  voices: [
    {
      // melody
      // wave: 'square',
      volume: 0.7,
      duration: 0.12, // sixteenth notes
      freq: 'A4', // 0 note
      // env: 'bachBass',
      instrument: 4, // 4 E.Piano
    },
    {
      // melody
      // wave: 'square',
      volume: 0.7,
      duration: 0.12, // sixteenth notes
      freq: 'A4', // 0 note
      // env: 'bachBass',
      instrument: 4, // 4 E.Piano
    },
    {
      // bass
      // wave: 'square',
      volume: 1,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 4, // 4 E.Piano
    },
    {
      // bass
      // wave: 'square',
      volume: 1,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      // env: 'bachBass',
      instrument: 4, // 4 E.Piano
    },
  ],

  score: [
    [
      [_, s, s, s, s, s, _, _, s, s, s, s, 7, 7, 7, 7],
      [_, s, s, s, s, s, _, _, s, _, s, _, 4, 4, 4, 4],
      [7, s, 7, s, s, s, 7, s, 7, s, 7, s, s, s, s, s],
      [4, s, 4, s, s, _, 4, s, 4, s, 4, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [0, s, 0, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, -5, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 0, s, 4, s, 7, s, 12, s, 11, s, 9, s, 7, s],
      [0, s, -3, s, 0, s, 0, s, 7, s, 7, s, 7, s, 4, s],
      [0, s, 0, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, -5, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 5, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [2, s, 2, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-3, s, -3, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 2, s, 5, s, 9, s, 12, s, 11, s, 9, s, 7, s],
      [2, s, -1, s, 2, s, 2, s, 5, s, 5, s, 5, s, 4, s],
      [2, s, s, s, 2, s, s, s, 2, s, s, s, 2, s, s, s],
      [-3, s, s, s, -3, s, s, s, -3, s, s, s, -3, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [0, s, 0, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, -5, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 0, s, 4, s, 7, s, 12, s, 11, s, 9, s, 7, s],
      [0, s, -3, s, 0, s, 0, s, 7, s, 7, s, 7, s, 4, s],
      [7, s, 7, s, s, s, s, s, 12, s, s, s, 10, s, s, s],
      [4, s, 4, s, s, s, s, s, 7, s, s, s, 6, s, s, s],
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 5, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [5, s, s, s, 5, s, s, s, s, s, s, s, 5, s, s, s],
      [2, s, s, s, 2, s, s, s, s, s, s, s, 2, s, s, s],
    ],
    [
      [9, s, 2, s, 5, s, 9, s, 12, s, 11, s, 9, s, 7, s],
      [2, s, -1, s, 2, s, 2, s, 5, s, 5, s, 5, s, 4, s],
      [9, s, s, s, s, s, s, s, 14, s, s, s, 11, s, s, s],
      [5, s, s, s, s, s, s, s, 7, s, s, s, 5, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 8, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 4, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, 0, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, 4, s],
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 5, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 8, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, 5, s, 5, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, 2, s, 2, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [4, s, 2, s, 4, s, 2, s, 4, s, 2, s, 4, s, 2, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [4, s, 2, s, 4, s, 2, s, 4, s, 2, s, 4, s, 2, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 8, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 4, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-1, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 5, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 8, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [9, s, 7, s, 9, s, 7, s, 9, s, 7, s, 9, s, 8, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [7, s, 4, s, 0, s, 4, s, 7, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [s, s, 4, s, 0, s, 4, s, 9, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [4, s, 2, s, 4, s, 2, s, 4, s, 2, s, 4, s, 2, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [_, s, 2, s, 4, s, 7, s, 9, s, 2, s, 4, s, 2, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [4, s, 2, s, 0, s, 2, s, 4, s, 0, s, 2, s, 7, s],
      [0, s, 0, s, -3, s, -3, s, -3, s, -3, s, 0, s, 0, s],
      [4, s, 2, s, 4, s, 2, s, 4, s, 2, s, 4, s, 2, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [4, s, 2, s, s, s, 2, s, 4, s, -1, s, 0, s, 2, s],
      [-4, s, -4, s, s, s, s, s, _, s, s, s, s, s, s, s],
      [4, s, 2, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [4, s, 2, s, 4, s, 2, s, 4, s, 2, s, 4, s, 2, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 0, s, 7, s, 8, s, 4, s, 0, s, 7, s],
      [_, s, s, s, s, s, s, s, _, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 8, s, 9, s, 11, s, 12, s, 7, s, 4, s, 0, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [12, s, 8, s, 9, s, 11, s, 12, s, 7, s, 4, s, 0, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 5, s, 7, s, 8, s, 9, s, 4, s, 0, s, -5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [0, s, 4, s, -5, s, 0, s, 4, s, s, s, 4, s, 2, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [4, s, 2, s, 4, s, 2, s, 4, s, 2, s, 4, s, 2, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 0, s, 7, s, 8, s, 4, s, 0, s, 7, s],
      [_, s, s, s, s, s, s, s, _, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, 8, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 8, s, 9, s, 11, s, 12, s, 7, s, 4, s, 0, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, 8, s, 9, s, 11, s, 12, s, 7, s, 4, s, 0, s],
      [0, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
    ],
    [
      [12, s, 8, s, 9, s, 11, s, 12, s, 7, s, 4, s, 0, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [12, s, 8, s, 9, s, 11, s, 12, s, 7, s, 4, s, 0, s],
      [7, s, s, s, s, s, s, s, 5, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 5, s, 7, s, 8, s, 9, s, 4, s, 0, s, -5, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [0, s, 4, s, -5, s, 0, s, 4, s, s, s, 2, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, 11, s, s, s],
      [4, s, s, s, s, s, s, s, s, s, s, s, 2, s, s, s],
    ],
    [
      [7, s, s, _, s, s, s, s, _, s, s, s, s, s, 7, 7],
      [4, s, s, s, s, s, s, s, _, s, s, s, s, s, 4, 4],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [0, s, 0, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, -5, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 0, s, 4, s, 7, s, 12, s, 11, s, 9, s, 7, s],
      [0, s, -3, s, 0, s, 0, s, 7, s, 7, s, 7, s, 4, s],
      [0, s, 0, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, -5, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 5, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [2, s, 2, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-3, s, -3, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 2, s, 5, s, 9, s, 12, s, 11, s, 9, s, 7, s],
      [2, s, -1, s, 2, s, 2, s, 5, s, 5, s, 5, s, 4, s],
      [2, s, s, s, 2, s, s, s, 2, s, s, s, 2, s, s, s],
      [-3, s, s, s, -3, s, s, s, -3, s, s, s, -3, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [0, s, 0, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, -5, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 0, s, 4, s, 7, s, 12, s, 11, s, 9, s, 7, s],
      [0, s, -3, s, 0, s, 0, s, 7, s, 7, s, 7, s, 4, s],
      [7, s, 7, s, s, s, s, s, 12, s, s, s, 10, s, s, s],
      [4, s, 4, s, s, s, s, s, 7, s, s, s, 6, s, s, s],
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 5, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [5, s, s, s, 5, s, s, s, s, s, s, s, 5, s, s, s],
      [2, s, s, s, 2, s, s, s, s, s, s, s, 2, s, s, s],
    ],
    [
      [9, s, 2, s, 5, s, 9, s, 12, s, 11, s, 9, s, 7, s],
      [2, s, -1, s, 2, s, 2, s, 5, s, 5, s, 5, s, 4, s],
      [9, s, s, s, s, s, s, s, 14, s, s, s, 11, s, s, s],
      [5, s, s, s, s, s, s, s, 7, s, s, s, 5, s, s, s],
    ],
    [
      [7, s, 4, s, 7, s, 4, s, 7, s, 4, s, 7, s, 4, s],
      [0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s, 0, s],
      [0, s, 0, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, -5, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 0, s, 4, s, 7, s, 12, s, 11, s, 9, s, 7, s],
      [0, s, -3, s, 0, s, 0, s, 7, s, 7, s, 7, s, 4, s],
      [0, s, 0, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, -5, s, s, s, s, s, s, s, s, s, s, s, s, s],
      // { start: 1 }, // start of envelope and start of measure, full volume
    ],
    [
      [9, s, 5, s, 9, s, 5, s, 9, s, 5, s, 9, s, 5, s],
      [2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s, 2, s],
      [2, s, 2, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-3, s, -3, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [9, s, 2, s, 5, s, 9, s, 12, s, 11, s, 9, s, 7, s],
      [2, s, -1, s, 2, s, 2, s, 5, s, 5, s, 5, s, 4, s],
      [2, s, s, s, 2, s, s, s, 2, s, s, s, 2, s, s, s],
      [-3, s, s, s, -3, s, s, s, -3, s, s, s, -3, s, s, s],
      // { end: 0 }, // end of envelope and end of measure, silent
    ],
  ],
} as const satisfies Song
