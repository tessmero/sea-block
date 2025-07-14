/**
 * @file composite-element.ts
 *
 * Visual element composed of solid-color parts.
 */
import type { Color } from 'three'

// visual element with geometry for each part
export type CompositeElement<TPart extends string> = {
  partNames: ReadonlyArray<TPart>
}

// colors for each part of a composite
export type CompositeStyle<TPart extends string = string> = {
  [partName in TPart]: Color
}
