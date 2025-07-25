/**
 * @file sketch-ball.ts
 *
 * Unused song from sketch-ball demo.
 */
import { Song } from '../../ts-to-midi'
const _ = 'rest'
const s = 'sustain'

const _DUR = 0.2

export default {

  voices: [
    {
      // melody
      // wave: 'sine',
      volume: 0.6,
      duration: _DUR, // sixteenth notes
      freq: 'A2', // 0 note
      instrument: 43, // 43 contra bass
      // env: 'bachBass',
    },
    {
      // melody
      // wave: 'sine',
      volume: 0.8,
      duration: _DUR, // sixteenth notes
      freq: 'A2', // 0 note
      instrument: 43, // 43 contra bass
      // env: 'bachBass',
    },
    {
      // melody
      // wave: 'sine',
      volume: 1,
      duration: _DUR, // sixteenth notes
      freq: 'A2', // 0 note
      instrument: 43, // 43 contra bass
      // env: 'bachBass',
    },
    {
      // kick drum
      duration: _DUR, // sixteenth notes
      // wave: 'sin',
      volume: 1,
      // env: 'attack',
      // startFreq: 150, // 0 note
      // endFreq: 10,
      freq: 'A4',
      instrument: 117, // 117 melodic tom
    },
    {
      // high hat
      duration: _DUR, // sixteenth notes
      // wave: 'sh',
      volume: 1,
      // env: 'attack',
      freq: 'A4', // 0 note
      instrument: 117, // 117 melodic tom
    },
  ],

  score: [
    [
      [15, s, 22, s, s, s, 15, s, 15, s, 22, s, s, s, 15, s],
      [3, s, 10, s, s, s, 3, s, 3, s, 10, s, s, s, 3, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, _, _, 1, 1, 1, _, _, _, _, _, 1, 1, 1, _, _],
      [_, _, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 22, s, s, s, 22, s, 24, s],
      [3, s, 10, s, s, s, 3, s, 10, s, s, s, 10, s, 12, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, _, _, _, 1, _, 1, _, s, s, s],
      [_, s, _, s, s, s, s, s, s, s, _, _, s, s, s, s],
    ],
    [
      [24, s, 20, s, s, s, 22, s, 24, s, 20, s, s, s, 22, s],
      [12, s, 12, s, s, s, s, s, s, s, s, s, s, s, 10, s],
      [_, _, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, _, s, s, s, s, 1, 1, 1, _, s],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [27, s, 22, s, s, s, 22, s, 27, s, 24, 17, s, s, 15, s],
      [15, s, s, s, s, s, 10, s, 15, s, s, s, s, s, 3, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, _, s, s, 1, 1, 1, _, 1, _, _],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 15, s, 22, s, s, s, 15, s],
      [3, s, 10, s, s, s, 3, s, 3, s, 10, s, s, s, 3, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, _, _, 1, 1, 1, _, _, _, _, _, 1, 1, 1, _, _],
      [_, _, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 22, s, 20, s, 22, s, 24, s],
      [3, s, 10, s, s, s, 3, s, 10, s, 8, s, 10, s, 12, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, _, _, _, 1, _, 1, _, 1, _, _],
      [_, s, _, s, s, s, s, s, s, s, _, _, s, s, s, s],
    ],
    [
      [24, s, 20, s, s, s, 22, s, 24, s, 20, s, s, s, 22, s],
      [12, s, 12, s, s, s, s, s, s, s, s, s, s, s, 10, s],
      [_, _, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, _, s, s, s, s, 1, 1, 1, _, s],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [27, s, 22, s, s, s, 22, s, 27, s, 24, 19, s, s, 24, s],
      [15, s, s, s, s, s, 10, s, 15, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, _, s, s, 1, 1, 1, _, 1, _, s],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [22, s, 24, s, s, s, 22, s, 24, s, 27, s, s, s, 24, s],
      [12, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, _, s, s, s, s, 1, 1, 1, _, s],
      [_, _, _, _, _, _, s, _, s, _, s, s, s, s, s, _],
    ],
    [
      [24, s, 22, s, s, s, 22, s, 24, s, s, 22, s, s, 24, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, 1, 1, 1, _, s, s, 1, 1, 1, _, _, _, 1],
      [_, s, _, s, s, s, _, _, s, s, s, s, s, s, s, s],
    ],
    [
      [22, s, s, 19, 15, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [15, s, s, s, s, s, s, s, 14, s, s, 10, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, _, 1, 1, 1, 1, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [19, s, s, 17, 12, s, s, s, 12, s, s, 9, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, _, 1, 1, 1, 1, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [19, s, s, 17, 12, s, s, s, 12, s, s, 9, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 27],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 22],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 15],
      [1, _, _, 1, 1, _, _, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 15, s, 22, s, s, s, 15, s],
      [12, s, 15, s, s, s, 12, s, 12, s, 15, s, s, s, 12, s],
      [3, s, 10, s, s, s, 3, s, 3, s, 10, s, s, s, 3, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, _, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 15, s, 22, s, s, s, 15, s],
      [12, s, 15, s, s, s, 12, s, 12, s, 15, s, s, s, 12, s],
      [3, s, 10, s, s, s, 3, s, 3, s, 10, s, s, s, 3, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, _, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 22, s, s, s, 22, s, 24, s],
      [12, s, 15, s, s, s, 12, s, 19, s, 15, s, 17, s, 19, s],
      [3, s, 10, s, s, s, 3, s, 10, s, 8, s, 10, s, 12, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, _, _, s, s, s, s],
    ],
    [
      [24, s, 20, s, s, s, 22, s, 24, s, 20, s, s, s, 22, s],
      [20, s, 15, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [12, s, 12, s, s, s, s, s, s, s, s, s, s, s, 10, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [27, s, 22, s, s, s, 22, s, 27, s, 24, 19, s, s, 15, s],
      [19, s, s, s, s, s, 17, s, 19, s, 17, 15, s, s, _, s],
      [15, s, s, s, s, s, 10, s, 15, s, s, s, s, s, 3, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, 1, 1, _, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 15, s, 22, s, s, s, 15, s],
      [12, s, 15, s, s, s, 12, s, 12, s, 15, s, s, s, 12, s],
      [3, s, 10, s, s, s, 3, s, 3, s, 10, s, s, s, 3, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, _, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 22, s, s, s, 22, s, 24, s],
      [12, s, 15, s, s, s, 12, s, 15, s, s, s, 15, s, 17, s],
      [3, s, 10, s, s, s, 3, s, 10, s, s, s, 10, s, 8, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, _, _, s, s, s, s],
    ],
    [
      [24, s, 20, s, s, s, 22, s, 24, s, 20, s, s, s, 22, s],
      [20, s, 15, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [12, s, 12, s, s, s, s, s, s, s, s, s, s, s, 10, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [27, s, 22, s, s, s, 22, s, 27, s, 24, 19, s, s, 19, s],
      [19, s, s, s, s, s, 17, s, 19, s, 17, 15, s, s, 14, s],
      [15, s, s, s, s, s, 10, s, 15, s, s, 10, s, s, s, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, 1, 1, _, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [22, s, 24, s, s, s, 22, s, 24, s, 27, s, s, s, 24, s],
      [15, s, s, s, s, s, s, s, s, s, s, s, 14, s, 12, s],
      [12, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, _, _, _, _, _, s, _, s, _, s, s, s, s, s, _],
    ],
    [
      [24, s, 22, s, s, s, 22, s, 24, s, s, 22, s, s, 24, s],
      [12, s, s, s, _, s, 10, s, 12, s, s, 10, s, s, 12, s],
      [_, s, s, s, _, s, s, s, s, s, s, s, s, s, s, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, 1, 1, _, 1, _, 1],
      [_, s, _, s, s, s, _, _, s, s, s, s, s, s, s, s],
    ],
    [
      [22, 19, 15, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [10, 8, 3, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [15, s, s, s, s, s, s, s, 14, s, s, 10, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, 22, 29],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, 15, 17],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, _, 1, 1, 1, 1, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [19, s, s, 17, 12, s, s, s, 12, s, s, 9, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, _, 1, 1, 1, 1, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [19, s, s, 17, 12, s, s, s, 12, s, s, 9, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 27],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 22],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 15],
      [1, _, _, 1, 1, _, _, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 15, s, 22, s, s, s, 15, s],
      [12, s, 15, s, s, s, 12, s, 12, s, 15, s, s, s, 12, s],
      [3, s, 10, s, s, s, 3, s, 3, s, 10, s, s, s, 3, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, _, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 15, s, 22, s, s, s, 15, s],
      [12, s, 15, s, s, s, 12, s, 12, s, 15, s, s, s, 12, s],
      [3, s, 10, s, s, s, 3, s, 3, s, 10, s, s, s, 3, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, _, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 22, s, s, s, 22, s, 24, s],
      [12, s, 15, s, s, s, 12, s, 19, s, 15, s, 17, s, 19, s],
      [3, s, 10, s, s, s, 3, s, 10, s, 8, s, 10, s, 12, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, _, _, s, s, s, s],
    ],
    [
      [24, s, 20, s, s, s, 22, s, 24, s, 20, s, s, s, 22, s],
      [20, s, 15, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [12, s, 12, s, s, s, s, s, s, s, s, s, s, s, 10, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [27, s, 22, s, s, s, 22, s, 27, s, 24, 19, s, s, 15, s],
      [19, s, s, s, s, s, 17, s, 19, s, 17, 15, s, s, _, s],
      [15, s, s, s, s, s, 10, s, 15, s, s, s, s, s, 3, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, 1, 1, _, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 15, s, 22, s, s, s, 15, s],
      [12, s, 15, s, s, s, 12, s, 12, s, 15, s, s, s, 12, s],
      [3, s, 10, s, s, s, 3, s, 3, s, 10, s, s, s, 3, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, _, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 22, s, s, s, 15, s, 22, s, s, s, 22, s, 24, s],
      [12, s, 15, s, s, s, 12, s, 15, s, s, s, 15, s, 17, s],
      [3, s, 10, s, s, s, 3, s, 10, s, s, s, 10, s, 8, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, _, _, s, s, s, s],
    ],
    [
      [24, s, 20, s, s, s, 22, s, 24, s, 20, s, s, s, 22, s],
      [20, s, 15, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [12, s, 12, s, s, s, s, s, s, s, s, s, s, s, 10, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [27, s, 22, s, s, s, 22, s, 27, s, 24, 19, s, s, 19, s],
      [19, s, s, s, s, s, 17, s, 19, s, 17, 15, s, s, 14, s],
      [15, s, s, s, s, s, 10, s, 15, s, s, 10, s, s, s, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, 1, 1, _, 1, _, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [22, s, 24, s, s, s, 22, s, 24, s, 27, s, s, s, 24, s],
      [15, s, s, s, s, s, s, s, s, s, s, s, 14, s, 12, s],
      [12, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, _, 1, 1, 1, _, 1],
      [_, _, _, _, _, _, s, _, s, _, s, s, s, s, s, _],
    ],
    [
      [24, s, 22, s, s, s, 22, s, 24, s, s, 22, s, s, 24, s],
      [12, s, s, s, _, s, 10, s, 12, s, s, 10, s, s, 12, s],
      [_, s, s, s, _, s, s, s, s, s, s, s, s, s, s, s],
      [_, 1, _, 1, 1, 1, _, 1, _, 1, 1, 1, _, 1, _, 1],
      [_, s, _, s, s, s, _, _, s, s, s, s, s, s, s, s],
    ],
    [
      [22, 19, 15, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [10, 8, 3, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [15, s, s, s, s, s, s, s, 14, s, s, 10, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, 22, 29],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, 15, 17],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, _, 1, 1, 1, 1, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [19, s, s, 17, 12, s, s, s, 12, s, s, 9, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, _, 1, 1, 1, 1, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [31, s, s, 29, 22, s, s, s, 21, s, s, 20, s, s, s, 27],
      [22, s, s, 22, 24, s, s, s, s, s, s, s, s, s, s, 22],
      [19, s, s, 17, 12, s, s, s, 12, s, s, 9, s, s, s, 15],
      [1, _, _, _, 1, _, _, 1, 1, _, _, _, s, 1, _, 1],
      [_, s, _, s, _, s, _, s, _, s, _, s, _, s, _, s],
    ],
    [
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 27],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 22],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, 15],
      [1, _, _, 1, 1, _, _, 1, 1, _, _, 1, 1, 1, 1, 1],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, _, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
  ],
} satisfies Song
