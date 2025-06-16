export interface Vector {
  x: number
  y: number
  z: number
}

export function add(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function multiply(a: Vector, scalar: number): Vector {
  return { x: a.x * scalar, y: a.y * scalar, z: a.z * scalar }
}
