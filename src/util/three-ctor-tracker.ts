/**
 * @file three-ctor-tracker.ts
 *
 * Keep track of how many times THREE objects like
 * Vector3 are constructed. These should not be constructed
 * in the animaton loop.
 *
 * Requires local patch to be applied to three (npx patch-package).
 */
import * as THREE from 'three'

const TRACKED_CTORS = [
  'Vector2', 'Vector3', 'Vector4',
  'Matrix3', 'Matrix4',
  'Box3', 'Object3D',
  'Color', 'Spherical',
] as const
type TrackedCtor = (typeof TRACKED_CTORS)[number]

function getCount(ctorName) {
  return (THREE as any)[ctorName].constructedCount || 0
}

function snapshot() {
  const counts = {}
  for (const ctorName of TRACKED_CTORS) {
    counts[ctorName] = getCount(ctorName)
  }
  return counts as Record<TrackedCtor, number>
}

export function startThreeCtorCheck() {
  const startCounts = snapshot()
  setTimeout(() => {
    for (const ctorName of TRACKED_CTORS) {
      const delta = getCount(ctorName) - startCounts[ctorName]
      if (delta > 0) {
        console.log(`constructed ${delta} ${ctorName} in one second`)
      }
    }
  }, 1000)
}

// Sample every second
window.setInterval(startThreeCtorCheck, 1000)
