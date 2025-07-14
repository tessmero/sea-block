/**
 * @file index.ts
 *
 * Imports all the .ts files in the rules folder
 * to define the sea-block eslint plugin.
 */

// import fs from 'fs'
// import path from 'path'

// const rulesDir = path.join(__dirname, 'rules')
// const ruleFiles = fs.readdirSync(rulesDir).filter(file => file.endsWith('.ts'))
// const rules: Record<string, LooseRuleDefinition> = {}
// for (const file of ruleFiles) {
//   const ruleName = path.basename(file, '.ts')

//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   const rule = require(path.join(rulesDir, file)) as LooseRuleDefinition

//   rules[ruleName] = rule
// }

import fileHeader from './rules/file-header'
import noThreeNamespaceImport from './rules/no-three-namespace-import'
import noConstructor from './rules/no-constructor'

const rules = {
  'no-constructor': noConstructor,
  'file-header': fileHeader,
  'no-three-namespace-import': noThreeNamespaceImport,
} as const

const plugin = {
  rules,
}

export default plugin
