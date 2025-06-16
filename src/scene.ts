/**
 * @file scene.ts
 * reset-able game scene
 **/
import * as THREE from 'three'
import { BoxTerrain } from './box-terrain'
import { PhysicsTiles } from './physics-tiles'
import { Sphere } from './sphere'
import { SphereGroup } from './sphere-group'
import { TerrainGridConfig } from './terrain-grid-config'
import { DEBUG_PICKED_POINT, GRID_DETAIL } from './settings'
import { MichaelConfig, MichaelTG } from './michael-tg'

export function buildScene(config: MichaelConfig): {
  grid: TerrainGridConfig
  terrain: BoxTerrain
  sphereGroup: SphereGroup
  scene: THREE.Scene
  debugPoint: THREE.Object3D
} {
  // Grid configuration
  const grid = new TerrainGridConfig(GRID_DETAIL, GRID_DETAIL)

  // Scene setup
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xaaccff)

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1))
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)

  // Terrain
  const terrain = new BoxTerrain(grid)
  terrain.terrainGenerator = new MichaelTG(config)
  terrain.build()
  scene.add(terrain.mesh)

  const physicsTiles = new PhysicsTiles(grid)
  terrain.physicsTiles = physicsTiles

  // Create spheres
  const sphereGroup = new SphereGroup(10).build()
  sphereGroup.terrain = terrain
  scene.add(sphereGroup.mesh)
  const testPositions = Array.from({ length: 10 }, () => ({
    x: (Math.random() - 0.5) * 20,
    y: 10 + Math.random() * 5,
    z: (Math.random() - 0.5) * 20,
  }))

  // give spheres unique colors
  const sphereColors = Array.from({ length: 10 }, (_, i) =>
    new THREE.Color().setHSL(i / 10, 0.8, 0.5),
  )
  for (let i = 0; i < testPositions.length; i++) {
    const sphere = new Sphere({ position: testPositions[i], velocity: { x: 0, y: 0, z: 0 } })
    sphere.color = sphereColors[i].getStyle()
    sphereGroup.addSphere(sphere)
    sphereGroup.setInstanceColor(i, sphereColors[i])
  }

  // Create a debug sphere
  const debugGeometry = new THREE.SphereGeometry(3, 16, 16)
  const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const debugPoint = new THREE.Mesh(debugGeometry, debugMaterial)
  debugPoint.visible = DEBUG_PICKED_POINT
  scene.add(debugPoint)

  return { grid, scene, terrain, sphereGroup, debugPoint }
}
