/**
 * @file controls-gui.ts
 *
 * Used in main.js to build user interface to control terrain generator settings.
 */
import * as dat from 'dat.gui'

export type NumericParam = {
  value: number
  min: number
  max: number
  step: number
  graphical?: boolean
}

// nestable lists of numeric params
// -> folders and items in dat.GUI interface
export type GeneratorConfig = {
  [key: string]: NumericParam | GeneratorConfig
}

let _allControls: Record<string, dat.GUIController> = {}

export function showControls(
  config: GeneratorConfig,
  onChange: (param: NumericParam) => void,
) {
  _allControls = {} // flat list of controls

  // add controls container to document
  const gui = new dat.GUI()

  addButton(gui, 'tessmero/sea-block (Viewer)', () => {
    window.open('https://github.com/tessmero/sea-block', '_blank')
  })
  addButton(gui, 'Michael2-3B/Procedural-Perlin-Terrain', () => {
    window.open('https://github.com/Michael2-3B/Procedural-Perlin-Terrain', '_blank')
  })

  // build folders and items for terrain generator config
  addControls(gui, config, onChange)

  // // add test button
  // const label = 'test'
  // const obj = { [label]: () => {
  //   console.log('test')
  // } }
  // gui.add(obj, label)
}

function addControls(
  gui: dat.GUI,
  config: GeneratorConfig,
  onChange: (param: NumericParam) => void,
) {
  for (const key in config) {
    const entry = config[key]
    if ('value' in entry && typeof entry.value === 'number') {
      const np = entry as NumericParam
      const ctrl = gui.add(entry, 'value', np.min, np.max).step(np.step).name(camelCaseToLabel(key))
      if (onChange) {
        ctrl.onChange((value) => {
          entry.value = value
          onChange(np)
        })
      }
      _allControls[key] = ctrl
    }
    else {
      // Nested group
      const folder = gui.addFolder(camelCaseToLabel(key))
      addControls(folder, entry as GeneratorConfig, onChange)
    }
  }
}

function camelCaseToLabel(input: string): string {
  return input
    .replace(/([A-Z])/g, ' $1') // Insert space before each uppercase letter
    .replace(/^./, str => str.toUpperCase()) // Capitalize the first character
    .trim()
}

function addButton(gui: dat.GUI, label: string, action: () => void) {
  const obj = { [label]: action }
  gui.add(obj, label)
}
