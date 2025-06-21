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
    [key: string]: ConfigParam | Config
  }
}

// base type for bottom-level items
export interface BaseParam extends Annotatable {
  value: number | string
  resetOnChange?: 'physics' | 'full'
  hidden?: boolean
}

// numeric slider
export interface NumericParam extends BaseParam {
  value: number
  min?: number
  max?: number
  step?: number
}

// dropdown list
export interface OptionParam extends BaseParam {
  value: string
  options: Option[]
}

export type Option = | string | { value: string, label?: string, tooltip?: string }

export type ConfigParam = BaseParam | NumericParam | OptionParam
