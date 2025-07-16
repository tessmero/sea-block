/**
 * @file puppet.test.ts
 *
 * Test sequence for sea-block.
 */

import { TestBatch } from 'demo-tests'

TestBatch.describeTests({
  targets: [
    {
      shortName: 'demo',
      name: 'development build of sea-block',
      serverCmd: [
        'python3', ['-m', 'http.server', '8642'], { cwd: '../sea-block/dist' },
      ],
      url: 'http://localhost:8642/index.html',
    },
    {
      shortName: 'site',
      name: 'development build of tessmero.github.io',
      url: 'http://localhost:4000/sea-block/',
    },
  ],
  sequence: [
    {
      test: 'reaches-state',
      targetState: 'splash-screen',
    },
    {
      test: 'click-changes-state',
      state: 'splash-screen',
      targetState: 'start-sequence',
    },
    {
      test: 'camera-is-draggable',
      state: 'start-sequence',
      startDrag: [200, 200],
      endDrag: [600, 400],
      eps: 10, // distance threshold
    },
  ],
})
