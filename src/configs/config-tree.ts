/**
 * @file config-tree.ts
 *
 * Base types for nestable configurations that can be shown as
 * folders and items in user interface.
 */

// common properties for both folders and items
export type Annotatable = {
  label?: string
  tooltip?: string
}

// nestable list of named parameters
export interface ConfigTree extends Annotatable {
  children: ConfigChildren
}

export type ConfigChildren = {
  [key: string]: ConfigButton | ConfigItem | ConfigTree
}

// base type for bottom-level items
export interface ConfigItem extends Annotatable {
  value: number | string
  resetOnChange?: 'physics' | 'full'
  hidden?: boolean
}

export interface ConfigButton extends Annotatable {
  action: () => void
  noEffect?: boolean // true for buttons that don't change anything
}

// numeric slider
export interface NumericParam extends ConfigItem {
  value: number
  min?: number
  max?: number
  step?: number
}

// dropdown list
export interface OptionParam extends ConfigItem {
  value: string
  options: Option[]
}

export type Option = string | AnnotatedOption

export interface AnnotatedOption extends Annotatable {
  value: string
}
