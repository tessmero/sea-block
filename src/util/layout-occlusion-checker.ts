/**
 * @file layout-occlusion-checker.ts
 *
 * Calculates how a set of rectangular elements are covering
 * eachother.
 */

import type { ElementId, GuiElement } from 'guis/gui'
import type { ComputedRects, Rectangle } from './layout-parser'

export function computeElementOcclusions(
  elements: Record<ElementId, GuiElement>, // back-to-front elements
  layoutRectangles: ComputedRects,
): Record<ElementId, Set<ElementId>> {
  const result = {}

  const allIds = Object.keys(elements)

  for (const [i, id] of allIds.entries()) {
    const { layoutKey } = elements[id]
    const rect = layoutRectangles[layoutKey]
    if (!rect) {
      continue
    }
    const occluding = new Set()
    for (let j = i + 1; j < allIds.length; j++) {
      const otherId = allIds[j]
      const otherElem = elements[otherId]
      const otherRect = layoutRectangles[otherElem.layoutKey]
      if (!otherRect) {
        continue
      }
      if (checkOverlap(rect, otherRect)) {
        occluding.add(otherId)

        // console.log(`computed (${id}/${layoutKey}) occluded by (${otherId}/${otherElem.layoutKey})`)
      }
    }
    result[id] = occluding
  }

  return result
}

function checkOverlap(a: Rectangle, b: Rectangle) {
  return !(
    a.x + a.w <= b.x // a is to the left of b
    || b.x + b.w <= a.x // a is to the right of b
    || a.y + a.h <= b.y // a is above b
    || b.y + b.h <= a.y // a is below b
  )
}
