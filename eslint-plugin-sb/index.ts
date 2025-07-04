/**
 * @file index.ts
 *
 * Imports all the .ts files in the rules folder
 * to define the sea-block eslint plugin.
 */
import fs from 'fs'
import path from 'path'

const rulesDir = path.join(__dirname, 'rules')
const ruleFiles = fs.readdirSync(rulesDir).filter(file => file.endsWith('.ts'))
const rules: Record<string, unknown> = {}
for (const file of ruleFiles) {
  const ruleName = path.basename(file, '.ts')

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rule = require(path.join(rulesDir, file))

  rules[ruleName] = rule
}

// export plugin object
export default {
  rules,
}

// import fileHeaderRule from './rules/file-header'
// const rules = {
//   'file-header': fileHeaderRule,
// }
