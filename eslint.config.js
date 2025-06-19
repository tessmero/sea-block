/**
 * @file eslint.config.js
 *
 * Linting rules for sea-block.
 */

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import jsdoc from 'eslint-plugin-jsdoc'

// rules defined in this repository (sea-block)
import eslintPluginSb from './eslint-plugin-sb/index.cjs'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs.recommended,
  jsdoc.configs['flat/recommended-typescript'],
  {
    plugins: { jsdoc, eslintPluginSb },
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
      'jsdoc/require-description-complete-sentence': ['off', 'warn', { tags: ['param'] }],

      // exclude sentence check for just @file (replaced by file-header)
      // 'jsdoc/require-description-complete-sentence': ['off', { tags: ['file'] }],

      // Require @file at the top of every file
      'jsdoc/require-file-overview': 'warn',

      // Require filename and description following local rule
      'eslintPluginSb/file-header': 'error',

      'no-console': 'warn', // warning for console.log and console.error

      // // require a description in JSDoc blocks
      // 'jsdoc/require-description': 'warn',

    },
  },
  {
    // overrides for local plugin source
    files: ['eslint-plugin-sb/**/*.cjs'],
    rules: {

      // allow require
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },
)
