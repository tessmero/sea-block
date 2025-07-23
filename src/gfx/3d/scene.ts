/**
 * @file scene.ts
 *
 * The sea-block three.js scene which may be re-built after startup.
 */
import { AmbientLight, Scene } from 'three'
import type { SeaBlock } from 'sea-block'

export function buildScene(seaBlock: SeaBlock): Scene {
  // Scene setup
  const scene = new Scene()
  scene.background = seaBlock.style.getBackgroundColor()

  // Lights
  scene.add(new AmbientLight(0xffffff, 1))
  // const directionalLight = new DirectionalLight(0xffffff, 1)
  // directionalLight.position.set(5, 10, 5)
  // scene.add(directionalLight)

  // terrain
  seaBlock.terrain.subgroups.forEach(subgroup => subgroup.addToScene(scene))

  // flora
  seaBlock.floraGroup.subgroups.forEach(subgroup => subgroup.addToScene(scene))

  // spheres
  seaBlock.sphereGroup.subgroups.forEach(subgroup => subgroup.addToScene(scene))

  return scene
}
