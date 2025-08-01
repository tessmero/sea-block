/**
 * @file chess.ts
 *
 * Simplified version of couperin song that plays in chess demo.
 * https://www.classtab.org/couperin_les_barricades_mysterieuses.txt.
 */

import { Song } from '../../ts-to-midi'
const _ = 'rest'
// const s = 'sustain'

// repeated measures 2-8
const _M28 = [
  [
    [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 5, _],
    [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
  ],
  [
    [_, _, 2, _, 3, _, 0, _, _, _, -4, _, 0, _, 3, _],
    [0, _, _, _, 7, _, _, _, -5, _, _, _, 3, _, _, _],
  ],
  [
    [0, _, 3, _, 8, _, 3, _, _, _, 0, 8, 7, _, 5, _],
    [-4, _, _, _, 10, _, _, _, -2, _, _, _, _, _, _, _],
  ],
  [
    [7, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
    [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
  ],
  [
    [7, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
    [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
  ],
  [
    [_, _, 2, _, 3, _, 0, _, _, _, -4, _, 0, _, 3, _],
    [0, _, _, _, 7, _, _, _, -5, _, _, _, 3, _, _, _],
  ],
  [
    [0, _, 2, _, 3, _, -2, _, _, _, -2, _, 3, _, 2, _],
    [-4, _, _, _, 5, _, _, _, -2, _, _, _, 8, _, _, _],
  ],
]

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
      freq: 'A3', // 0 note
      instrument: 35, // 35 fretless bass
    },
  ],

  score: [
    // 1
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 5, _],
      [_, _, _, _, 3, _, _, _, 10, _, _, _, -2, _, _, _],
    ],

    // 2
    ..._M28,

    // 9
    [
      [7, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 10, _, _, _],
    ],

    // second repeat to m2
    ..._M28,

    // 17 (10 in tab)
    [
      [3, _, 7, _, 10, _, 7, _, _, _, 5, _, 10, _, 5, _],
      [3, _, _, _, 15, _, _, _, 10, _, _, _, 14, _, _, _],
    ],
    [
      [_, _, 7, _, 10, _, 7, _, _, _, 5, _, 10, _, 5, _],
      [3, _, _, _, 15, _, _, _, 10, _, _, _, 14, _, _, _],
    ],
    [
      [_, _, 7, _, 10, _, 7, _, _, _, 5, _, 10, _, 5, _],
      [3, _, _, _, 15, _, _, _, 2, _, _, _, 10, _, _, _],
    ],
    [
      [_, _, 3, _, 10, _, 3, _, _, _, 3, _, 9, _, 3, _],
      [0, _, _, _, 10, _, _, _, 5, _, _, _, 10, _, _, _],
    ],
    [
      [10, _, 2, _, 5, _, 2, _, _, _, 0, _, 5, _, 0, _],
      [-2, _, _, _, 10, _, _, _, 5, _, _, _, 9, _, _, _],
    ],
    [
      [_, _, 2, _, 5, _, 2, _, _, _, 0, _, 5, _, 0, _],
      [-2, _, _, _, 10, _, _, _, 5, _, _, _, 9, _, _, _],
    ],
    [
      [_, _, 2, _, 5, _, 2, _, _, _, 2, _, 5, _, 2, _],
      [-2, _, _, _, 10, _, _, _, 3, _, _, _, 10, _, _, _],
    ],
    [
      [_, _, 2, _, 7, _, 0, _, _, _, _, 2, 0, _, -2, _],
      [3, _, _, _, 10, _, _, _, 0, _, _, _, _, _, _, _],
    ],
    [
      [-2, _, 2, _, 5, _, 2, _, _, _, 0, _, 8, _, 2, _],
      [-2, _, _, _, 10, _, _, _, 5, _, _, _, 5, _, _, _],
    ],
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 1, _, 10, _, 1, _],
      [0, _, _, _, 12, _, _, _, 7, _, _, _, -5, _, _, _],
    ],
    [
      [_, _, 0, _, 3, _, 0, _, _, _, 0, _, 8, _, 0, _],
      [-4, _, _, _, 8, _, _, _, 5, _, _, _, 5, _, _, _],
    ],
    [
      [_, _, 2, _, 8, _, 2, _, _, _, 3, _, 7, _, 3, _],
      [-2, _, _, _, 10, _, _, _, 3, _, _, _, 3, _, _, _],
    ],
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [-2, _, _, _, 3, _, _, _, 10, _, _, _, -2, _, _, _],
    ],
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, 2, _, 3, _, -2, _, _, _, -4, _, 3, _, 2, _],
      [0, _, _, _, 7, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [0, _, 3, _, 8, _, 0, _, _, _, _, 8, 7, _, 5, _],
      [-4, _, _, _, 5, _, _, _, -2, _, _, _, _, _, _, _],
    ],
    [
      [7, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 10, _, _, _],
    ],
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, 2, _, 3, _, 0, _, _, _, -2, _, 3, _, 2, _],
      [0, _, _, _, 7, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [0, _, 2, _, 3, _, -2, _, _, _, -2, _, 3, _, 2, _],
      [-4, _, _, _, 5, _, _, _, -2, _, _, _, 8, _, _, _],
    ],

    // 30 in tab
    [
      [3, _, 0, _, 7, _, 0, _, _, _, 0, _, 5, _, -1, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, 2, _, 3, _, 0, _, _, _, 0, _, 2, _, -2, _],
      [0, _, _, _, 7, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [0, _, 8, _, 12, _, 8, _, _, _, 8, _, 10, _, 7, _],
      [-4, _, _, _, 8, _, _, _, 4, _, _, _, 0, _, _, _],
    ],
    [
      [_, _, 7, _, 8, _, 5, _, _, _, 5, _, 7, _, 4, _],
      [5, _, _, _, -2, _, _, _, 0, _, _, _, 0, _, _, _],
    ],
    [
      [5, _, 0, _, 8, _, 0, _, _, _, -2, _, 7, _, -2, _],
      [5, _, _, _, 5, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [_, _, 7, _, 8, _, 7, _, 5, _, 3, _, 2, _, 0, _],
      [-4, _, _, _, 8, _, _, _, -3, _, _, _, 5, _, _, _],
    ],
    [
      [2, _, 3, _, 5, _, 3, _, -2, _, 5, _, 10, _, 2, _],
      [-2, _, _, _, 3, _, _, _, _, _, _, _, -2, _, _, _],
    ],
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, 2, _, 3, _, 0, _, _, _, -2, _, 3, _, 2, _],
      [0, _, _, _, 7, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [0, _, 3, _, 8, _, 0, _, _, _, _, 8, 7, _, 5, _],
      [-4, _, _, _, 5, _, _, _, -2, _, _, _, _, _, _, _],
    ],
    [
      [7, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 10, _, _, _],
    ],
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, 2, _, 3, _, 0, _, _, _, -2, _, 3, _, 2, _],
      [0, _, _, _, 7, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [0, _, 2, _, 3, _, -2, _, _, _, -2, _, 3, _, 2, _],
      [-4, _, _, _, 5, _, _, _, -2, _, _, _, 8, _, _, _],
    ],

    [
      [3, _, 3, _, 7, _, 3, _, _, _, 3, _, 8, _, 3, _],
      [3, _, _, _, 10, _, _, _, 0, _, _, _, 12, _, _, _],
    ],
    [
      [_, _, 3, _, 5, _, 1, _, _, _, 5, _, 10, _, 5, _],
      [1, _, _, _, 8, _, _, _, -2, _, _, _, 13, _, _, _],
    ],
    [
      [_, _, 5, _, 7, _, 3, _, _, _, 3, _, 8, _, 3, _],
      [3, _, _, _, 10, _, _, _, 0, _, _, _, 12, _, _, _],
    ],
    [
      [_, _, 5, _, 8, _, 5, _, _, _, 2, _, 7, _, 2, _],
      [1, _, _, _, 10, _, _, _, 3, _, _, _, 10, _, _, _],
    ],
    [
      [8, _, _, 3, 0, _, 3, _, _, _, 8, _, 12, _, 8, _],
      [-4, _, _, _, _, _, _, _, 8, _, _, _, 15, _, _, _],
    ],
    [
      [_, _, 5, _, 12, _, 5, _, _, _, 5, _, 12, _, 5, _],
      [9, _, _, _, 15, _, _, _, 5, _, _, _, 15, _, _, _],
    ],
    [
      [_, _, 5, _, 12, _, 5, _, _, _, 5, _, 12, _, 5, _],
      [10, _, _, _, 13, _, _, _, 8, _, _, _, 13, _, _, _],
    ],
    [
      [_, _, 7, _, 10, _, 7, _, _, _, 7, _, 10, _, 7, _],
      [7, _, _, _, 13, _, _, _, 3, _, _, _, 13, _, _, _],
    ],
    [
      [_, _, 3, _, 10, _, 3, _, _, _, 3, _, 10, _, 3, _],
      [8, _, _, _, 12, _, _, _, 7, _, _, _, 12, _, _, _],
    ],
    [
      [_, _, 5, _, 8, _, 5, _, _, _, 5, _, 8, _, 5, _],
      [5, _, _, _, 12, _, _, _, 2, _, _, _, 12, _, _, _],
    ],
    [
      [_, _, 2, _, 8, _, 2, _, _, _, 2, _, 8, _, 2, _],
      [7, _, _, _, 10, _, _, _, 5, _, _, _, 10, _, _, _],
    ],

    // 55 in tab
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 3, _, 7, _, 3, _],
      [3, _, _, _, 10, _, _, _, 0, _, _, _, 10, _, _, _],
    ],
    [
      [_, _, -2, _, 7, _, -2, _, _, _, -2, _, 7, _, -2, _],
      [5, _, _, _, 8, _, _, _, 3, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, 2, _, 5, _, 2, _, _, _, 2, _, 5, _, 2, _],
      [2, _, _, _, 8, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, -2, _, 5, _, -2, _, _, _, -2, _, 3, _, -2, _],
      [3, _, _, _, 7, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [_, _, 0, _, 3, _, 0, _, _, _, -2, _, 3, _, -2, _],
      [-4, _, _, _, 5, _, _, _, -1, _, _, _, 5, _, _, _],
    ],
    [
      [_, _, -3, _, 3, _, -3, _, _, _, -2, _, 3, _, -2, _],
      [0, _, _, _, 5, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [_, _, 0, _, 3, _, 0, _, _, _, -4, _, 3, _, -4, _],
      [-4, _, _, _, 5, _, _, _, 0, _, _, _, 5, _, _, _],
    ],
    [
      [_, _, -2, _, 3, _, 2, _, _, _, -2, _, 3, _, -2, _],
      [-2, _, _, _, 5, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [_, _, 0, _, 3, _, 0, _, _, _, -2, _, 3, _, -2, _],
      [-4, _, _, _, 5, _, _, _, -2, _, _, _, 7, _, _, _],
    ],
    [
      [_, _, -4, _, 3, _, -4, _, _, _, 0, _, 3, _, 0, _],
      [0, _, _, _, 5, _, _, _, -4, _, _, _, 7, _, _, _],
    ],
    [
      [_, _, -2, _, 3, _, -2, _, _, _, -2, _, 3, _, 2, _],
      [-2, _, _, _, 7, _, _, _, 8, _, _, _, -2, _, _, _],
    ],
    [
      [3, _, 3, _, 8, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 10, _, _, _],
    ],
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, 2, _, 3, _, 0, _, _, _, -2, _, 3, _, 2, _],
      [0, _, _, _, 7, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [0, _, 3, _, 8, _, 0, _, _, _, -2, 8, 7, _, 5, _],
      [-4, _, _, _, 5, _, _, _, -2, _, _, _, _, _, _, _],
    ],
    [
      [7, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 10, _, _, _],
    ],
    [
      [_, _, 3, _, 7, _, 3, _, _, _, 5, _, 10, _, 2, _],
      [3, _, _, _, 10, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [_, _, 2, _, 3, _, 0, _, _, _, -2, _, 3, _, 2, _],
      [0, _, _, _, 7, _, _, _, -5, _, _, _, 7, _, _, _],
    ],
    [
      [0, _, 2, _, 3, _, -2, _, _, _, -2, _, 3, _, 2, _],
      [-4, _, _, _, 5, _, _, _, -2, _, _, _, 8, _, _, _],
    ],
    [
      [3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
      [3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    ],
  ],
} satisfies Song
