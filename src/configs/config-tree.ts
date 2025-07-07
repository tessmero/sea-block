/**
 * @file config-tree.ts
 *
 * Base types for nestable configurations that can be shown as
 * folders and items in user interface.
 *
 * The bottom-level child keys are assumed to be unique globally.
 */

// nestable list of named parameters
export interface ConfigTree extends Annotatable {
  children: ConfigChildren
}

export type ConfigChildren = Record<string, ConfigButton | ConfigItem | ConfigTree>

// common properties for both folders and items
export interface Annotatable {
  label?: string
  tooltip?: string
}

// common properties for bottom-level configurable items
export interface BaseItem extends Annotatable {
  value: number | string
  resetOnChange?: 'physics' | 'full'
  isHidden?: boolean
}

export interface ConfigButton extends Annotatable {
  action: () => void | Promise<void>
  hasNoEffect?: boolean // true for buttons that don't change anything
}

// numeric slider
export interface NumericItem extends BaseItem {
  value: number
  min?: number
  max?: number
  step?: number
}

// dropdown list
export interface OptionItem extends BaseItem {
  value: string
  options: Array<Option>
}

export type ConfigItem = OptionItem | NumericItem
export type Option = string | AnnotatedOption

export interface AnnotatedOption extends Annotatable {
  value: string
}
