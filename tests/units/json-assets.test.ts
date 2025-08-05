import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Ajv from 'ajv'

// Map JSON file globs or paths to their schema files
const SCHEMA_MAP: Record<string, string> = {
  'gfx/2d/font.json': 'font.schema.json',
  // add more mappings as needed
}

const SRC_DIR = path.resolve(__dirname, '../../src')
const SCHEMAS_DIR = path.resolve(__dirname, '../schemas')

function findJsonFiles(dir: string): string[] {
  let results: string[] = []
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry)
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(findJsonFiles(fullPath))
    } else if (entry.endsWith('.json')) {
      results.push(fullPath)
    }
  }
  return results
}

describe('JSON Assets', function () {
  const ajv = new Ajv()
  const jsonFiles = findJsonFiles(SRC_DIR)

  for (const file of jsonFiles) {
    // Determine schema based on relative path
    const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/')
    const schemaFile = SCHEMA_MAP[relPath]
    if (!schemaFile) continue // skip files without schema

    it(`validates: ${relPath}`, function () {
      const schemaPath = path.join(SCHEMAS_DIR, schemaFile)
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
      const validate = ajv.compile(schema)
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      const valid = validate(data)
      assert.ok(valid, `Validation failed for ${relPath}: ${JSON.stringify(validate.errors)}`)
    })
  }
})
