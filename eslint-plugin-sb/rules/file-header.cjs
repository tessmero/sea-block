/**
 * @file file-header.cjs
 *
 * Rule to require file headers like this.
 */

const path = require('path')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require a file-level JSDoc @file tag matching the filename and description format.',
    },
    fixable: null,
    schema: [],
    messages: {
      // missing jsdoc @file covered by jsdoc/require-file-overview
      // missing: 'File must start with a JSDoc block containing an @file tag.',
      filename: '@file tag must start with filename {{expected}}.',
      space: 'Must have blank line between filename and description',
      sentence: 'File description must start with an uppercase letter and end with a period.',
    },
  },
  create(context) {
    return {
      Program(_node) {
        const source = context.getSourceCode()
        const comments = source.getAllComments()
        if (!comments.length || comments[0].type !== 'Block' || !comments[0].value.startsWith('*')) {
          // missing jsdoc @file covered by jsdoc/require-file-overview
          // context.report({ messageId: 'missing' })
          return // do nothing
        }

        const loc = comments[0].loc // location in code to highlight
        const jsdoc = comments[0].value // string content
        let filename, description

        // Match @file tag
        const fileTagMatch = jsdoc.match(/@file\s+([^\s]+)\s*([\s\S]*)/)
        if (fileTagMatch) {
          filename = fileTagMatch[1] // "must-match-filename.ts"
          description = fileTagMatch[2] // "Must start with uppercase letter and end with period."
          description = description.replace(/^\s*\*\s?/gm, '').trim() // remove leading * from each line
        }
        else {
          // missing jsdoc @file covered by jsdoc/require-file-overview
          // context.report({ loc, messageId: 'missing' })
          return // do nothing
        }

        // second line must be empty
        const allLines = jsdoc.split('\n').map(s => s.replace(/^\s*\*\s?/, '')) // remove leading *
        if (allLines[2].trim() !== '') { // 3rd in array, includes a line for opening "/**"
          context.report({ loc, messageId: 'space' })
        }

        // filename must be correct
        const expectedFile = path.basename(context.filename)
        if (filename !== expectedFile) {
          context.report({
            loc,
            messageId: 'filename',
            data: { expected: expectedFile },
          })
        }

        // description must start with uppercase and end with period
        if (!/^[A-Z]/.test(description) || !/\.\s*$/.test(description)) {
          context.report({ loc, messageId: 'sentence' })
        }
      },
    }
  },
}
