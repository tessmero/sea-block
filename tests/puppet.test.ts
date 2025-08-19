/**
 * @file puppet.test.ts
 *
 * Generates reports on tessmero.github.io.
 */

import { execSync } from 'child_process'

let TestBatch: any // eslint-disable-line @typescript-eslint/no-explicit-any
let HtmlRenderer: any // eslint-disable-line @typescript-eslint/no-explicit-any
let wasSkipped = false

describe('puppeteer/playwright tests', function () {
  before(function () {
    try {
      const module = require('demo-tests') // eslint-disable-line @typescript-eslint/no-require-imports
      TestBatch = module.TestBatch
      HtmlRenderer = module.HtmlRenderer
    }
    catch {
      // demo-tests not installed
      wasSkipped = true
      this.skip()
    }
  })

  it('runs test batch', function () {
    TestBatch.describeTests(params)
  })
})

const params = {
  targets: [
    {
      shortName: 'demo',
      name: 'development build of sea-block',
      serverCmd: [
        'python3', ['-m', 'http.server', '8642'], { cwd: 'dist' },
      ],
      url: 'http://localhost:8642/index.html',
    },
    // {
    //   shortName: 'site',
    //   name: 'development build of tessmero.github.io',
    //   url: 'http://localhost:4000/sea-block/',
    // },
  ],
  sequence: [
    {
      test: 'reaches-state',
      targetState: 'splash-screen',
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
  ],
}

before(function () {
  const cmd = `rm ${process.cwd()}/reports/*.json`
  try {
    execSync(cmd)
  }
  catch {
    // console.error(cmd)
  }
})

after(function () {
  if (wasSkipped) return
  const reportsFolder = `${process.cwd()}/reports`
  new HtmlRenderer(reportsFolder).renderReport('index')
})
