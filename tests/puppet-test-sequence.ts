/**
 * @file puppet-test-sequence.ts
 *
 * Sequence for puppet test.
 */

export const puppetTestSequence = [
  {
    test: 'reaches-state',
    targetState: 'splash-screen',
  },
  {
    test: 'change-default-setting',
    key: 'transitionMode',
    defaultValue: 'enabled',
    value: 'skip',
  },
  {
    test: 'buttons-are-hoverable',
    state: 'splash-screen',
    buttons: [
      'launch',
    ],
    backgroundPoint: [200, 100],
  },
  {
    test: 'button-changes-state',
    state: 'splash-screen',
    button: 'launch',
    targetState: 'free-cam',
  },
  {
    test: 'camera-is-draggable',
    state: 'free-cam',
    startDrag: [200, 200],
    endDrag: [600, 400],
    eps: 10, // distance threshold
  },
  {
    test: 'buttons-are-hoverable',
    state: 'free-cam',
    buttons: [
      'settingsBtn',
      'rookMesh',
    ],
    backgroundPoint: [200, 100],
  },
  {
    test: 'button-click-sequence',
    state: 'free-cam',
    buttons: [
      'rookMesh',
      'grabbedMeshPlayButton',
    ],
  },
  {
    test: 'reaches-state',
    targetState: 'chess',
  },
  {
    test: 'buttons-are-hoverable',
    state: 'chess',
    buttons: [
      'pawnBtn',
      'topRightBtn',
      'chessBoard(2,-1)', // allowed move to right
      'chessBoard(-1,-2)', // allowed move to near
    ],
    backgroundPoint: [100, 100],
  },

  // 2025-08-19 bug: pawn placement only worked on first level
  // complete 1st level and start placing pawn on 2nd level
  {
    test: 'button-click-sequence',
    state: 'chess',
    buttons: [
      'chessBoard(0,-1)',
      'chessBoard(0,2)', // move to first level goal
      'leftReward',
      'confirmBtn', // go to second level
      'pawnBtn', // start placing pawn
    ],
  },
  {
    test: 'buttons-are-hoverable',
    state: 'chess',
    buttons: [
      // pawn should be place-able on near-right tile
      'chessBoard(2,-2)',
    ],
    backgroundPoint: [100, 100],
  },
]
