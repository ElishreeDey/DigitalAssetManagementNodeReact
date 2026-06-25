/*
 ****************************************************************************************************************************
 * Filename    : index
 * Description : Barrel index entry point for all controller functions.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

export {
  register,
  login,
  logout,
  curLoggedInUser,
  listAccounts,
} from './authController'

export {
  uploadMiddleware,
  uploadAssets,
  listAssets,
  listSharedAssets,
  streamAsset,
  streamThumbnail,
  downloadAsset,
  deleteAsset,
  shareAsset,
  listAssetShares,
  deleteShare,
  updateSharePermission,
} from './assetController'

export {
  createTeam,
  listTeams,
  listMembers,
  addMember,
  removeMember,
  deleteTeam,
} from './teamController'
