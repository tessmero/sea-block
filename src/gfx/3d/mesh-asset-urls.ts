/**
 * @file mesh-asset-urls.ts
 *
 * List of 3d model assets.
 */

// find public/obj -type f | sed 's|^public/obj/||;s|$|\",|;s|^|\"|'
export const MESH_ASSET_URLS = [

  'raft/thruster.obj',

  'kenney/chest.obj',

  'chess/bishop.obj',
  'chess/king.obj',
  'chess/knight.obj',
  'chess/pawn.obj',
  'chess/queen.obj',
  'chess/rook.obj',
] as const
export type MeshAssetUrl = (typeof MESH_ASSET_URLS)[number]
