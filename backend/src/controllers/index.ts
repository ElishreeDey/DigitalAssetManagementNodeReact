/*
 ****************************************************************************************************************************
 * Filename    : index
 * Description : Barrel index entry point for all controller functions.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

// All controllers for Application User authentication
export {
  register,
  login,
  logout,
  curLoggedInUser,
  listAccounts,
} from './authController'

// All controller names for Asset
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

// All controller names for Team
export {
  createTeam,
  listTeams,
  listMembers,
  addMember,
  removeMember,
  deleteTeam,
  updateTeam,
} from './teamController'
