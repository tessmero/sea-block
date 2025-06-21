/**
 * @file fixtures.ts
 *
 * Global test setup required in .mocharc.json.
 */

import * as mocha from 'mocha'
import { RuleTester } from '@typescript-eslint/rule-tester'

RuleTester.afterAll = mocha.after
