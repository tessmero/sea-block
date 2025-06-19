/**
 * @file scene.ts
 *
 * The sea-block scene which may be re-built after startup.
 */
import * as THREE from 'three'
import { TileGroup } from './groups/tile-group'
import { SphereGroup } from './groups/sphere-group'
import { TerrainGridIndex } from './grid-logic/terrain-grid-index'
import { DEBUG_PICKED_POINT, GRID_DETAIL } from './settings'
import { MichaelConfig, MichaelTG } from './generators/michael-tg'

export function buildScene(config: MichaelConfig): {
  grid: TerrainGridIndex
  terrain: TileGroup
  sphereGroup: SphereGroup
  scene: THREE.Scene
  debugPoint: THREE.Object3D
} {
  // Grid configuration
  const grid = new TerrainGridIndex(GRID_DETAIL, GRID_DETAIL)

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
  const sphereGroup = new SphereGroup(10, terrain).build()
  scene.add(sphereGroup.mesh)

  // Create a debug sphere
  const debugGeometry = new THREE.SphereGeometry(3, 16, 16)
  const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const debugPoint = new THREE.Mesh(debugGeometry, debugMaterial)
  debugPoint.visible = DEBUG_PICKED_POINT
  scene.add(debugPoint)

  return { grid, scene, terrain, sphereGroup, debugPoint }
}
