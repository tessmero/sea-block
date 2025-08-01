/**
 * @file util.ts
 *
 * Helpers used in tools and tests.
 */
import path from 'path'
import * as glob from 'glob'
import { ImpManifest } from '../src/imp-names'

// load all implementations of a base class. Used in tools and tests
export function populateRegistry(manifest: ImpManifest) {
  const baseDir = path.join(__dirname, '..')
  for (const pattern of manifest.SOURCES) {
    const absPattern = path.join(baseDir, pattern)
    // console.log(`absPattern: ${absPattern}`)
    for (const file of glob.sync(absPattern)) {
      // console.log(`  file: ${file}`)

      // const modulesBefore = checkRequireCache()

      const modulePath = path.resolve(file)
      // delete require.cache[modulePath]
      const _reqResult = require(modulePath) // eslint-disable-line @typescript-eslint/no-require-imports
      // const { GridAnimation } = require(path.resolve(path.join(
      //   __dirname, '../src/gfx/grid-anims/grid-animation',
      // )))
      // console.log(JSON.stringify([...Object.keys(GridAnimation._registry)]))

      // console.log(`reqResult keys: ${JSON.stringify(Object.keys(reqResult))}`)

      // const modulesAfter = checkRequireCache()

      // diffModules(modulesBefore, modulesAfter)
    }
  }
}

// function diffModules(before: Snapshot, after: Snapshot) {
//   const count0 = before.srcModules.length
//   const count1 = after.srcModules.length
//   console.log(`  required ${count1 - count0} new source modules`)
// }

const srcPrefix = path.resolve(path.join(__dirname, '../src'))
function checkRequireCache(): Snapshot {
  const allModules = [...Object.keys(require.cache)]
  const srcModules = allModules.filter(path => path.startsWith(srcPrefix))
  return { srcModules, allModules }
}

export function flushSourceModules() {
  const { srcModules } = checkRequireCache()
  for (const module of srcModules) {
    delete require.cache[module]
  }
  // console.log(`flushed ${srcModules.length} source modules`)
}

type Snapshot = {
  srcModules: Array<string>
  allModules: Array<string>
}
