/**
 * @file element-test-game.ts
 *
 * Game implementation used to test game elemnts.
 */

import { simpleButtonLoader } from '../gfx/2d/flat-button'
import type { SeaBlock } from '../sea-block'
import type { FlatElement, GameElement } from './game'
import { Game } from './game'

const btnWidth = 20
const btnHeight = 10

const TEST_KEYS = ['br', 'tr', 'bl', 'tl'] as const
type TestKey = (typeof TEST_KEYS)[number]
function testFlatButton(testKey: TestKey): FlatElement {
  return {
    layoutKey: testKey,
    imageLoader: simpleButtonLoader(btnWidth, btnHeight, testKey),
  }
}

const gameElems: ReadonlyArray<GameElement> = TEST_KEYS.map(key => testFlatButton(key))

export class ElementTestGame extends Game {
  static {
    Game.register('element-test', {
      factory: () => new ElementTestGame(),
      elements: gameElems,
      layout: {
        tl: { width: btnWidth, height: btnHeight },
        tr: { width: btnWidth, height: btnHeight, right: 0 },
        bl: { width: btnWidth, height: btnHeight, bottom: 0 },
        br: { width: btnWidth, height: btnHeight, right: 0, bottom: 0 },
      },
    })
  }

  public reset(_context: SeaBlock): void {
    // do nothing
  }
}
