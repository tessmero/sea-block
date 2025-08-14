/**
 * @file scene.ts
 *
 * The sea-block three.js scene which may be re-built after startup.
 */
import type { Color, Vector3 } from 'three'
import { AmbientLight, DirectionalLight, Scene } from 'three'
import type { SeaBlock } from 'sea-block'

export type SeablockScene = {
  threeScene: Scene
  update: (cameraTarget: Vector3) => void
  setBackground: (color: Color) => void
  add: (Object3D) => void
}

export function buildScene(seaBlock: SeaBlock): SeablockScene {
  // Scene setup
  const scene = new Scene()

  // Lights
  scene.add(new AmbientLight(0xffffff, 1))
  const directionalLight = new DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)

  // const skyScale = 1000
  // const skyGeo = new BoxGeometry(skyScale,skyScale,skyScale)
  // const sky = new Mesh(skyGeo, new MeshBasicMaterial({
  //   color: seaBlock.style.getBackgroundColor(),
  // }))
  // sky.material.side = BackSide
  // scene.add(sky)

  // // sky
  // const sky = new Sky()
  // sky.scale.setScalar(450000)
  // const phi = MathUtils.degToRad(90)
  // const theta = MathUtils.degToRad(180)
  // const sunPosition = new Vector3().setFromSphericalCoords(1, phi, theta)
  // sky.material.uniforms.sunPosition.value = sunPosition
  // scene.add(sky)

  // terrain
  seaBlock.terrain.subgroups.forEach(subgroup => subgroup.addToScene(scene))

  // flora
  if (seaBlock.floraGroup) {
    seaBlock.floraGroup.subgroups.forEach(subgroup => subgroup.addToScene(scene))
  }

  // spheres
  if (seaBlock.sphereGroup) {
    seaBlock.sphereGroup.subgroups.forEach(subgroup => subgroup.addToScene(scene))
  }

  // game-specific elements
  if (seaBlock.game) {
    const currentGame = seaBlock.game
    if (currentGame.meshes.length > 0) {
      scene.add(...currentGame.meshes)
    }
  }

  return {
    threeScene: scene,
    update: (_target) => {}, // sky.position.copy(target),
    add: (...obj) => scene.add(...obj),
    setBackground: color => scene.background = color, // sky.material.color = color,
  }
}
