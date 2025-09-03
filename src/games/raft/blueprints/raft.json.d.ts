/**
 * @file raft.json.d.ts
 *
 * USed to import raft blueprint json file.
 */

declare module '*raft.json' {
  const value: RaftBlueprint
  export = value
}

export type RaftBlueprint = Array<Button | OtherPiece>

type Button = {
  type: 'button'
  x: number
  z: number
  triggers: Array<number> // wire connections to thrusters
}

type OtherPiece = {
  type: 'floor' | 'thruster'
  x: number
  z: number
}
