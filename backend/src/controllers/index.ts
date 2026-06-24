/*
 ****************************************************************************************************************************
 * Filename    : index
 * Description : Barrel index entry point for all controller functions.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

export { register, login, logout, curLoggedInUser } from './authController'

export {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from './userController'

export {
  uploadMiddleware,
  uploadAssets,
  listAssets,
  streamAsset,
  streamThumbnail,
  downloadAsset,
  deleteAsset,
} from './assetController'

export {
  createTeam,
  listTeams,
  listMembers,
  addMember,
  removeMember,
  deleteTeam,
} from './teamController'
