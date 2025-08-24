/**
 * @file raft-enums.ts
 *
 * List of parts and phases for raft builder game.
 */

export const PLACEABLE_PIECE_NAMES = [
  'floor',
  'thruster',
] as const
export type PlaceablePieceName = (typeof PLACEABLE_PIECE_NAMES)[number]

export const PIECE_NAMES = ['cockpit', ...PLACEABLE_PIECE_NAMES] as const
export type PieceName = (typeof PIECE_NAMES)[number]

export const RAFT_PHASES = [
  'idle',
  ...PLACEABLE_PIECE_NAMES.map(name => `place-${name}` as const),
] as const
export type RaftPhase = (typeof RAFT_PHASES)[number]
