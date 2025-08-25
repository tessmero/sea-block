/**
 * @file option-selector.ts
 *
 * Builds sets of gui elements to cycle over some options.
 */

import type { CssRuleset } from 'util/layout-parser'
import type { GuiElement } from 'guis/gui'
import type { SeaBlock } from 'sea-block'
import { resetFrontLayer } from 'gfx/2d/flat-gui-gfx-helper'

export type OptionParams = {
  layoutKey: string
  itemLabel: string
  options: ReadonlyArray<string>
  value: string
  onChange: (seaBlock: SeaBlock, value: string) => void
}

// ruleset to put in layout
export const optionLayout: CssRuleset = {
  width: 120,
  height: 24,
  children: {
    mainBtn: { width: 70, left: 24 },
    itemLabel: { width: 70, left: 28, top: 4 },
    valueLabel: { width: 70, left: 24, height: 12, bottom: 2 },
    prevBtn: { width: 24 },
    nextBtn: { width: 24, right: 0 },
  },
}

// build elements for sub-layout that inherits optionLayout
export function optionSelectorElements(params: OptionParams): Array<GuiElement> {
  const { layoutKey: parentKey, itemLabel, options, value, onChange } = params
  let currentValue: string = value

  // build label for each option
  const optionLabels = {} as Record<string, GuiElement>
  for (const optionValue of options) {
    optionLabels[optionValue] = {
      layoutKey: `${parentKey}.valueLabel`,
      display: {
        type: 'label',
        label: optionValue,
        isVisible: optionValue === value,
      },
    }
  }

  function change(seaBlock: SeaBlock, delta: number) {
    optionLabels[currentValue].display.isVisible = false

    const i = options.indexOf(currentValue)
    currentValue = options[(i + delta + options.length) % options.length]

    optionLabels[currentValue].display.isVisible = true
    onChange(seaBlock, currentValue)

    resetFrontLayer(seaBlock)
  }

  return [
    {
      layoutKey: `${parentKey}.mainBtn`,
      display: {
        type: 'button',
        border: '16x16-btn-square',
      },
      clickAction: ({ seaBlock }) => {
        change(seaBlock, 1)
      },
    },
    {
      layoutKey: `${parentKey}.itemLabel`,
      display: {
        type: 'label',
        label: itemLabel,
        font: 'mini',
        textAlign: 'top-left',
      },
    },
    ...Object.values(optionLabels),
    {
      layoutKey: `${parentKey}.prevBtn`,
      display: {
        type: 'button',
        icon: 'icons/16x16-arrow-left.png',
        border: '16x16-btn-square',
      },
      clickAction: ({ seaBlock }) => {
        change(seaBlock, -1)
      },
    },
    {
      layoutKey: `${parentKey}.nextBtn`,
      display: {
        type: 'button',
        icon: 'icons/16x16-arrow-right.png',
        border: '16x16-btn-square',
      },
      clickAction: ({ seaBlock }) => {
        change(seaBlock, 1)
      },
    },
  ]
}
