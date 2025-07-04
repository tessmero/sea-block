/**
 * @file controls-gui.ts
 *
 * Used in main.js to build user interface to control terrain generator settings.
 */
import * as dat from 'dat.gui'
import { ConfigTree, ConfigButton, ConfigItem, NumericParam, OptionParam } from '../configs/config-tree'

let _allControls: Record<string, dat.GUIController> = {}

let gui: dat.GUI

export function showControls(
  config: ConfigTree,
  onChange: (param: ConfigItem) => void,
) {
  _allControls = {} // flat list of controls

  // add controls container to document and replace any existing
  if (gui) {
    gui.destroy()
  }
  gui = new dat.GUI()

  // build folders and items for terrain generator config
  addControls(
    gui,
    config,
    onChange,
  )

  // // add test button
  // const label = 'test'
  // const obj = { [label]: () => {
  //   console.log('test')
  // } }
  // gui.add(obj, label)
}

function addControls(
  gui: dat.GUI,
  config: ConfigTree,
  onChange: (param: ConfigItem | ConfigButton) => void,
) {
  const children = config.children
  for (const key in children) {
    const entry = children[key]

    if (('hidden' in entry) && entry.hidden) {
      continue
    }

    if ('action' in entry) {
      // button
      const buttonItem = entry as ConfigButton
      const label = entry.label || camelCaseToLabel(key)
      const obj = { [label]: async () => {
        await buttonItem.action()
        if (!buttonItem.noEffect) {
          onChange(buttonItem)
        }
      } }
      gui.add(obj, label)
    }

    else if ('options' in entry && Array.isArray(entry.options)) {
      // Dropdown (option param)
      const op = entry as OptionParam
      const labelVals = {}
      for (const opt of op.options) {
        if (typeof opt === 'string') {
          labelVals[opt] = opt
        }
        else {
          labelVals[opt.label || opt.value] = opt.value
        }
      }
      const ctrl = gui.add(op, 'value', labelVals)
        .name(op.label || camelCaseToLabel(key))
        .listen()

      // Find the select element inside the controller
      const select = ctrl.domElement.querySelector('select')
      if (select) {
        for (const [i, option] of op.options.entries()) {
          if (typeof option !== 'string' && option.tooltip) {
            // set tooltip for one option in dropdown
            select.options[i].title = option.tooltip
          }
        }
      }

      if (onChange) {
        ctrl.onChange((value) => {
          op.value = value
          onChange(op)
        })
      }
      addTooltip(
        ctrl,
        op.tooltip,
      )
      _allControls[key] = ctrl
    }
    else if ('value' in entry && typeof entry.value === 'number') {
      // Numeric param
      const np = entry as NumericParam
      const ctrl = gui.add(np, 'value', np.min, np.max)
        .step(np.step)
        .name(np.label || camelCaseToLabel(key))
      if (onChange) {
        ctrl.onChange((value) => {
          np.value = value
          onChange(np)
        })
      }
      addTooltip(ctrl, np.tooltip)
      _allControls[key] = ctrl
    }
    else {
      // Nested group
      const folder = gui.addFolder(entry.label || camelCaseToLabel(key))
      addTooltip(
        folder,
        entry.tooltip,
      )
      addControls(
        folder,
        entry as ConfigTree,
        onChange,
      )
    }
  }
}

function addTooltip(controller, text?: string) {
  if (typeof text !== 'string' || text.trim() === '') {
    return
  }
  const element = controller.__li || controller.domElement
  element.setAttribute('title', text)
}

function camelCaseToLabel(input: string): string {
  // Check for UPPER_CASE (all caps, underscores, and numbers)
  if ((/^[A-Z0-9_]+$/).test(input)) {
    return input
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim()
  }
  // Default: camelCase or PascalCase
  return input
    .replace(/([A-Z])/g, ' $1') // Insert space before each uppercase letter
    .replace(/^./, str => str.toUpperCase()) // Capitalize the first character
    .trim()
}

// // Examples:
// console.log(camelCaseToLabel('PLAYER_ACCEL')); // "Player Accel"
// console.log(camelCaseToLabel('gravityForce')); // "Gravity Force"
// console.log(camelCaseToLabel('WAVE_AMPLITUDE')); // "Wave Amplitude"
// console.log(camelCaseToLabel('waveAmplitude')); // "Wave Amplitude"
