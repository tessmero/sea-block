/**
 * @file debug-controls.ts
 *
 * Used to display seaBlockConfig tree as html elements.
 */
import * as dat from 'lil-gui'
import type { ConfigTree, NumericItem, OptionItem } from '../configs/config-tree'
import type { SeaBlock } from '../sea-block'

let _allControls: Record<string, dat.GUIController> = {}

let gui: dat.GUI

export function toggleDebugControls(seaBlock: SeaBlock) {
  if (gui && !gui._closed) {
    // gui.close() // doesn't show animation like clicking collapse button
    gui.destroy()
    gui = undefined
  }
  else {
    showDebugControls(seaBlock)
  }
}

export function showDebugControls(seaBlock: SeaBlock) {
  const config = seaBlock.config.tree
  _allControls = {} // flat list of controls

  // add controls container to document and replace any existing
  if (gui) {
    gui.destroy()
  }
  gui = new dat.GUI({
    closeFolders: true, // start with folders collapsed
    container: document.getElementById('controls-container'),
  })
  // gui.close() // start collapsed

  // build folders and items for terrain generator config
  addControls(
    gui,
    config,
    seaBlock,
  )

  gui.onOpenClose(() => {
    if (gui._closed) {
      // console.log('main gui closed')
      // playSound('collapse')

      // hide after collapsing animation
      setTimeout(() => {
        gui.destroy()
        seaBlock.game.gui.resetElementStates(seaBlock) // unclick button in in-game gui
      }, 200)
    }
  })

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
  seaBlock: SeaBlock,
) {
  const children = config.children
  for (const key in children) {
    const entry = children[key]

    if ('isHidden' in entry && entry.isHidden) {
      continue
    }

    if ('action' in entry) {
      // button
      const buttonItem = entry
      const label = entry.label ?? camelCaseToLabel(key)
      const obj = { [label]: async () => {
        await buttonItem.action(seaBlock)
        if (!buttonItem.hasNoEffect) {
          seaBlock.onCtrlChange(buttonItem)
        }
      } }
      gui.add(obj, label)
    }

    else if ('options' in entry && Array.isArray(entry.options)) {
      // Dropdown (option param)
      const op = entry as OptionItem
      const labelVals = {}
      for (const opt of op.options) {
        if (typeof opt === 'string') {
          labelVals[opt] = opt
        }
        // else {
        //   labelVals[opt.label ?? opt.value] = opt.value
        // }
      }
      const ctrl = gui.add(op, 'value', labelVals)
        .name(op.label ?? camelCaseToLabel(key))
        .listen()

      // // Find the select element inside the controller
      // const select = ctrl.domElement.querySelector('select')
      // if (select) {
      //   for (const [i, option] of op.options.entries()) {
      //     if (typeof option !== 'string' && option.tooltip) {
      //       // set tooltip for one option in dropdown
      //       select.options[i].title = option.tooltip
      //     }
      //   }
      // }

      ctrl.onChange((value) => {
        op.value = value
        seaBlock.onCtrlChange(op)
      })
      addTooltip(
        ctrl,
        op.tooltip,
      )
      _allControls[key] = ctrl
    }
    else if ('value' in entry && typeof entry.value === 'number') {
      // Numeric param
      const np = entry as NumericItem
      const ctrl = gui.add(np, 'value', np.min, np.max)
        .name(np.label ?? camelCaseToLabel(key))
      if (np.step) {
        ctrl.step(np.step)
      }
      ctrl.onChange((value) => {
        if (typeof value === 'number') {
          np.value = value
          seaBlock.onCtrlChange(np)
        }
      })
      addTooltip(ctrl, np.tooltip)
      _allControls[key] = ctrl
    }
    else {
      // Nested group
      const folder = gui.addFolder(entry.label ?? camelCaseToLabel(key))

      addTooltip(
        folder,
        entry.tooltip,
      )
      addControls(
        folder,
        entry as ConfigTree,
        seaBlock,
      )
    }
  }
}

function addTooltip(controller: dat.GUIController | dat.GUI, text?: string) {
  if (typeof text !== 'string' || text.trim() === '') {
    return
  }
  const element = controller.domElement
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
