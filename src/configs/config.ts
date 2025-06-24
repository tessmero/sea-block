/**
 * @file config.ts
 *
 * Base types for configurations that can be shown as
 * folders and items in user interface.
 */

// common properties for both folders and items
export type Annotatable = {
  label?: string
  tooltip?: string
}

// nestable liss of named parameters
export interface Config extends Annotatable {
  params: {
    [key: string]: ConfigItem | Config
  }
}

// base type for bottom-level items
export interface ConfigItem extends Annotatable {
  value: number | string
  resetOnChange?: 'physics' | 'full'
  hidden?: boolean
}

export interface ConfigButton extends ConfigItem {
  action: () => void
  readonly?: boolean
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

export type Option = | string | { value: string, label?: string, tooltip?: string }
