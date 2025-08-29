/**
 * @file ivy-update.ts
 *
 * Update function from tessmero/ivy.
 */
import { fitToContainer } from './ivy-setup'
import type { Vine } from './math/ivy-vine'
import { smIvy } from './sm-ivy'

export function ivyUpdate(dt) {
  fitToContainer()
  smIvy.t += dt

  // update objects being drawn
  smIvy.allVines.forEach(v => v.update(dt))
  const newVines: Array<Vine> = []
  smIvy.allVines = smIvy.allVines.filter((v) => {
    if (v.isDone()) {
      newVines.push(...v.getNext())
      return false
    }
    return true
  })
  smIvy.allVines.push(...newVines)

  // autoreset periodically
  if (smIvy.allVines.length === 0) {
    if (smIvy.resetCountdown > 0) {
      smIvy.resetCountdown -= dt
    }
    else {
      fitToContainer(true)
    }
  }
}
