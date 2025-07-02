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
import { style } from './main'
import { gridConfig } from './configs/grid-config'

export class DebugElems {
  public directionPoint: THREE.Object3D
  public center: THREE.Object3D
  public adjacent: THREE.Object3D[]
  public diagonal: THREE.Object3D[]
  public normalArrow: THREE.ArrowHelper

  public refresh(): void {
    const debug = gridConfig.children.debug.value
    this.directionPoint.visible = debug === 'pick-direction'

    const showNeighbors = debug === 'pick-tile'
    this.center.visible = showNeighbors
    this.adjacent.forEach((e) => {
      e.visible = e.visible && showNeighbors
    })
    this.diagonal.forEach((e) => {
      e.visible = e.visible && showNeighbors
    })

    this.normalArrow.visible = debug === 'pick-tile'
  }
}

export function buildScene(): {
  grid: GridLayout
  terrain: TileGroup
  sphereGroup: SphereGroup
  scene: THREE.Scene
  debugElems: DebugElems
} {
  // Grid configuration
  const grid = new GridLayout(GRID_DETAIL, GRID_DETAIL)

  // Scene setup
  const scene = new THREE.Scene()
  scene.background = style.background

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1))
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)

  // Terrain
  const terrain = new TileGroup(grid)
  terrain.build()
  terrain.subgroups.forEach(subgroup => subgroup.addToScene(scene))

  // Create spheres
  const sphereGroup = new SphereGroup(10, terrain).build()
  sphereGroup.subgroups.forEach(subgroup => subgroup.addToScene(scene))

  // small debug spheres
  const n = 10, rad = 0.5
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

  return {
    grid,
    scene,
    terrain,
    sphereGroup,
    debugElems,
  }
}

function debugSphere(scene: THREE.Scene, radius: number, color: THREE.ColorRepresentation): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 8, 8)
  const material = new THREE.MeshBasicMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  return mesh
}
