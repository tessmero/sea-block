/**
 * @file file-header.test.cjs
 *
 * Test for the file-header rule.
 */

const { RuleTester } = require('eslint')
const ruleTester = new RuleTester()

ruleTester.run(
  'file-header',
  require('../rules/file-header.cjs'),

  // in test context filename is "<input>"
  {
    valid: [{
      code: `
        /**
         * @file <input>
         * 
         * This is a file.
         */
        class MyClass {
          constructor( param={} ){}
        }
      `,
    }, {
      code: `
        /**
         * @file <input>
         * 
         * This is a file.
         * This is a second sentence.
         */
        class MyClass {
          constructor( param={} ){}
        }
      `,
    }],

    invalid: [{
      // wrong filename
      code: `
        /**
         * @file wrong-filename.ts
         * 
         * This is also a file.
         */
        class MyClass {
          constructor( param={} ){}
        }
      `,
      errors: 1,
    }, {
      // no blank line before description
      code: `
        /**
         * @file <input>
         * This is a file.
         */
      `,
      errors: 1,
    }, {
      // no description
      code: `
        /**
         * @file <input>
         */
      `,
      errors: 1,
    }],
  },
)
