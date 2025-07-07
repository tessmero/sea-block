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

// rules defined in this repository (sea-block)
import eslintPluginSb from './eslint-plugin-sb'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,

  // @ts-expect-error works despite typescript error
  stylistic.configs.recommended,
  {
    plugins: { import: importPlugin, jsdoc, sb: eslintPluginSb },
  },
  {
    ignores: ['**/node_modules/', 'dist/**'],
  },
  {
    rules: {

      // limit line length
      'max-len': ['warn', { code: 120,
        // tabWidth: 2, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true
      }],

      // limit lines per file
      'max-lines': ['warn', { max: 400,
        // skipBlankLines: true, skipComments: true
      }],

      // limit lines per function
      'max-lines-per-function': ['warn', { max: 100,
        // skipBlankLines: true, skipComments: true
      }],

      // limit nesting control structures
      'max-depth': ['warn', { max: 5 }],

      // limit imports per file
      'import/max-dependencies': ['warn', { max: 20,
        // "ignoreTypeImports": false,
      }],

      // imports must be ordered
      'import/order': ['error'],

      // require Array or ReadonlyArray generic type instead of []
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],

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
          // booleans must be like isWater
          selector: ['variable', 'typeProperty'],
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'are', 'should', 'has', 'can', 'did', 'will'],
        },
        {
          // types must be PascalCase
          selector: ['typeLike'],
          format: ['PascalCase'],
        },
      ],
    },
  },
)
