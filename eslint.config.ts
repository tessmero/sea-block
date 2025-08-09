/**
 * @file eslint.config.ts
 *
 * Linting rules for sea-block.
 */

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import jsdoc from 'eslint-plugin-jsdoc'
import importPlugin from 'eslint-plugin-import'
import stylistic from '@stylistic/eslint-plugin'
import unusedImports from 'eslint-plugin-unused-imports'

// rules defined in this repository (sea-block)
import eslintPluginSb from './eslint-plugin-sb'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs.recommended,
  {
    plugins: {
      'import': importPlugin,
      jsdoc,
      'sb': eslintPluginSb,
      'unused-imports': unusedImports,
    },
  },
  {
    ignores: ['**/node_modules/', 'dist/**'],
  },
  {
    rules: {

      // must use performance.now() instead of Date.now()
      'sb/prefer-performance-now': ['warn'],

      // must use === and !== instead of == and !=
      'eqeqeq': ['warn'],

      // limit line length
      'max-len': ['warn', { code: 120,
        // tabWidth: 2, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true
      }],

      // limit lines per file
      'max-lines': ['warn', { max: 600,
        // skipBlankLines: true, skipComments: true
      }],

      // // limit lines per function
      // 'max-lines-per-function': ['warn', { max: 120,
      //   // skipBlankLines: true, skipComments: true
      // }],

      // // limit nesting control structures
      // 'max-depth': ['warn', { max: 5 }],

      // limit imports per file
      'import/max-dependencies': ['warn', { max: 20,
        // "ignoreTypeImports": false,
      }],

      // imports must be ordered
      // 'import/order': ['error'],

      // require Array<> or ReadonlyArray<> instead of []
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],

      // replace @typescript-eslint/no-unused-vars
      // with rules from unused-imports plugin
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn',
        {
          vars: 'local',

          // allow unused variables starting with underscores
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // do NOT require jsdoc comments
      'jsdoc/require-jsdoc': 'off',

      // do NOT require jsdoc descriptions start with uppercase, end with period
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

      // restrict "import" statements
      'no-restricted-imports': [
        'error', {
          patterns: [
            '**/main', // must not import main.ts entry point (circular import)
            '../../../*', // must not go up three levels with relative path
          ],
        },
      ],
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
  {
    // restrict "constructor" in named implementations using registry pattern
    files: [
      // implementations must not define constructors (just register with base class)
      'src/grid-logic/tilings/**/*.ts',
      'src/generators/**/*.ts',
      'src/games/imp/**/*.ts',
      'src/guis/imp/**/*.ts',
      'src/gfx/transitions/imp/**/*.ts',
      'src/configs/**/*.ts',
      'src/gfx/grid-anims/**/*.ts',
    ],
    ignores: [
      // base classes are exempt (they define protected constructor)
      'src/grid-logic/tilings/tiling.ts',
      'src/generators/terrain-generator.ts',
      'src/configs/configurable.ts',
      'src/gfx/grid-anims/grid-animation.ts',
    ],
    rules: {
      'sb/no-constructor': 'error',
    },
  },

  {
    // base classes using registry pattern must have "protected constructor"
    files: [
      'src/grid-logic/tilings/tiling.ts',
      'src/generators/terrain-generator.ts',
      'src/configs/configurable.ts',
      'src/gfx/grid-anims/grid-animation.ts',
      'src/guis/gui.ts',
      'src/games/game.ts',
    ],
    rules: {
      'sb/only-protected-ctor': 'error',
    },
  },

  // extra restrictions for source
  {
    files: ['src/**/*.ts'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // extends: [
    //   tseslint.configs.recommendedTypeChecked,
    //   tseslint.configs.stylisticTypeChecked,
    // ],
    rules: {

      // require "import type" for imports only used as type
      '@typescript-eslint/consistent-type-imports': 'error',

      // enforce variable naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          // booleans must be like isWater or needsUpdate
          selector: ['variable', 'typeProperty'],
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'are', 'should', 'has', 'can', 'did', 'will', 'needs'],
        },
        {
          // types must be PascalCase
          selector: ['typeLike'],
          format: ['PascalCase'],
        },
        {
          // Generic type parameter must start with letter T, followed by any uppercase letter.
          selector: 'typeParameter',
          format: ['PascalCase'],
          custom: { regex: '^T[A-Z]', match: true },
        },
      ],
    },
  },

  // require valid gui layout css
  {
    files: ['src/guis/layouts/**/*.ts'],
    ignores: ['src/guis/layouts/layout-helper.ts'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'sb/valid-layout': 'error',
    },
  },

  // additional restrictions for unit tests
  {
    files: ['tests/**/*.ts'],
    rules: {

      // prevent wrong "assert" import
      // incorrect: import { assert } from 'console'
      // correct: import assert from 'assert'
      'no-restricted-imports': ['error', { paths: [{
        name: 'console',
        importNames: ['assert'],
        message: 'Should use "import assert from \'assert\'".',
      }] }],
    },
  },
  {
    // allow console.log in tools
    files: ['tools/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
)
