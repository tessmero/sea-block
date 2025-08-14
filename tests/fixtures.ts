/**
 * @file fixtures.ts
 *
 * Global test setup required in .mocharc.json.
 */

import * as mocha from 'mocha'
import { RuleTester } from '@typescript-eslint/rule-tester'
RuleTester.afterAll = mocha.after

// test/test-setup.js
import { JSDOM } from 'jsdom'
import { createCanvas, Image } from 'canvas'

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  resources: 'usable',
})
dom.window.screen = { width: 64, height: 64 }
global.window = dom.window
global.document = dom.window.document

/* eslint-disable @typescript-eslint/no-explicit-any */
global.Image = Image as any
global.OffscreenCanvas = createCanvas(1, 1).constructor as any
global.OffscreenCanvasRenderingContext2D = createCanvas(1, 1).getContext('2d').constructor as any
