/**
 * @file index.cjs
 *
 * Imports all the .cjs files in the rules folder
 * to define the sea-block eslint plugin.
 */
const fs = require('fs')
const path = require('path')

const rulesDir = path.join(__dirname, 'rules')

const ruleFiles = fs.readdirSync(rulesDir).filter(file => file.endsWith('.cjs'))

const plugin = {
  rules: Object.fromEntries(
    ruleFiles.map(file => [
      path.basename(file, '.cjs'), // rule name

      require(path.join(rulesDir, file)), // rule

    ]),
  ),
}

module.exports = plugin
