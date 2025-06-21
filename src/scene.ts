/**
 * @file scene.ts
 *
 * The sea-block scene which may be re-built after startup.
 */
import * as THREE from 'three'
import { TileGroup } from './groups/tile-group'
import { SphereGroup } from './groups/sphere-group'
import { GridLayout } from './grid-logic/grid-layout'
import { GRID_DETAIL } from './settings'
import { MichaelConfig } from './configs/michael-config'
import { MichaelTG } from './generators/michael-tg'
import { getGridValues } from './configs/grid-config'

export class DebugElems {
  public directionPoint: THREE.Object3D
  public center: THREE.Object3D
  public adjacent: THREE.Object3D[]
  public diagonal: THREE.Object3D[]
  public normalArrow: THREE.ArrowHelper

  public refresh(): void {
    const gridVals = getGridValues()
    this.directionPoint.visible = gridVals.debug === 'pick-direction'

    const showNeighbors = gridVals.debug === 'pick-neighbors'
    this.center.visible = showNeighbors
    this.adjacent.forEach((e) => {
      e.visible = showNeighbors
    })
    this.diagonal.forEach((e) => {
      e.visible = showNeighbors
    })

    this.normalArrow.visible = gridVals.debug === 'pick-normal'
  }
}

export function buildScene(config: MichaelConfig): {
  grid: GridLayout
  terrain: TileGroup
  sphereGroup: SphereGroup
  scene: THREE.Scene
  debugElems: DebugElems
} {
  // Grid configuration
  const grid = new GridLayout(
    GRID_DETAIL,
    GRID_DETAIL,
  )

  // Scene setup
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xaaccff)

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1))
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)

  // Terrain
  const terrain = new TileGroup(grid)
  terrain.terrainGenerator = new MichaelTG(config)
  terrain.build()
  scene.add(terrain.mesh)

  // Create spheres
  const sphereGroup = new SphereGroup(
    10,
    terrain,
  ).build()
  scene.add(sphereGroup.mesh)

  // small debug spheres
  const n = 6, rad = 0.5
  const center = debugSphere(scene, rad, 'red')
  const adjacent = [], diagonal = []
  for (let i = 0; i < n; i++) {
    adjacent.push(debugSphere(scene, rad, 'yellow'))
    diagonal.push(debugSphere(scene, rad, 'blue'))
  }

  // big debug sphere
  const directionPoint = debugSphere(scene, 3, 'red')

  // debug arrow
  const normalArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0), // direction
    new THREE.Vector3(0, 0, 0), // origin
    4, // length
    'red', // color
  )
  scene.add(normalArrow)

  const debugElems = new DebugElems()
  debugElems.directionPoint = directionPoint
  debugElems.center = center
  debugElems.adjacent = adjacent
  debugElems.diagonal = diagonal
  debugElems.normalArrow = normalArrow
  debugElems.refresh()

  return { grid,
    scene,
    terrain,
    sphereGroup,
    debugElems }
}

function debugSphere(scene: THREE.Scene, radius: number, color: THREE.ColorRepresentation): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 8, 8)
  const material = new THREE.MeshBasicMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  return mesh
}
