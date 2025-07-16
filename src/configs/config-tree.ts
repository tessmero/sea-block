/**
 * @file config-tree.ts
 *
 * Base types for nestable configurations that can be shown as
 * folders and items in user interface.
 *
 * The bottom-level child keys are assumed to be unique globally.
 */

import type { SeaBlock } from '../sea-block'

// nestable list of named parameters
export interface ConfigTree extends Annotatable {
  children: ConfigChildren
}

export type ConfigChildren = Record<string, ConfigButton | ConfigItem | ConfigTree>

// common properties for both folders and items
export interface Annotatable {
  readonly label?: string
  readonly tooltip?: string
}

// common properties for bottom-level configurable items
export interface BaseItem extends Annotatable {
  value: number | string
  readonly resetOnChange?: 'physics' | 'full'
  readonly isHidden?: boolean
}

export interface ConfigButton extends Annotatable {
  readonly action: (seaBlock: SeaBlock) => void | Promise<void>
  readonly resetOnChange?: 'physics' | 'full'
  readonly hasNoEffect?: boolean // true if button changes nothing in sea-block
}

// numeric slider
export interface NumericItem extends BaseItem {
  value: number
  readonly min?: number
  readonly max?: number
  readonly step?: number
}

// dropdown list
export interface OptionItem<TOption extends string = string> extends BaseItem {
  value: TOption
  readonly options: ReadonlyArray<TOption>
}

export type ConfigItem = OptionItem | NumericItem
