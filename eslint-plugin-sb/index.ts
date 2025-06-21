/**
 * @file index.ts
 *
 * Imports all the .cjs files in the rules folder
 * to define the sea-block eslint plugin.
 */

import fileHeaderRule from './rules/file-header'

const rules = {
  'file-header': fileHeaderRule,
}

export default {
  rules,
}

// // index.ts
// import fs from 'fs';
// import path from 'path';

// // Path to the rules directory
// const rulesDir = path.join(__dirname, 'rules');

// // Get all .cjs files in the rules directory
// const ruleFiles = fs.readdirSync(rulesDir).filter(file => file.endsWith('.cjs'));

// // Build the rules object
// const rules: Record<string, unknown> = {};

// for (const file of ruleFiles) {
//   const ruleName = path.basename(file, '.cjs');
//   // Use require for CommonJS files
//   rules[ruleName] = require(path.join(rulesDir, file));
// }

// // Export the plugin object
// export default rules;
