/**
 * @file eslint.config.ts
 *
 * Linting rules for sea-block.
 */

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import jsdoc from 'eslint-plugin-jsdoc'

// rules defined in this repository (sea-block)
import eslintPluginSb from './eslint-plugin-sb'

export default [
  {
    plugins: { jsdoc, sb: eslintPluginSb },
  },
  {
    ignores: ['**/node_modules/', 'dist/*'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.recommended,
  jsdoc.configs['flat/recommended-typescript'],
  {
    rules: {

      // allow unused variables starting with underscores
      '@typescript-eslint/no-unused-vars': ['warn',
        {
          vars: 'local',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // do NOT require jsdoc comments
      'jsdoc/require-jsdoc': 'off',

      // require jsdoc descriptions start with uppercase, end with period
      'jsdoc/require-description-complete-sentence': ['off'], // 'warn', { tags: ['param'] }],

      // exclude sentence check for just @file (replaced by file-header)
      // 'jsdoc/require-description-complete-sentence': ['off', { tags: ['file'] }],

      // Require @file at the top of every file
      'jsdoc/require-file-overview': 'warn',

      // Require filename and description following local rule
      'sb/file-header': 'error',

      'no-console': 'warn', // warning for console.log and console.error

      // // require a description in JSDoc blocks
      // 'jsdoc/require-description': 'warn',

      // // disallow assigning UPPER_SNAKE_CASE variables
      // 'sb/no-upper-snake-case-declare': 'error',
      // 'sb/no-upper-snake-case-assign': 'error',
    },
  },
  {
    // extra restrictions for graphics
    files: ['src/gfx/**/*.ts'],
    rules: {

      // disallow import * as THREE from 'three'
      'sb/no-three-namespace-import': 'warn',
    },
  },
]
