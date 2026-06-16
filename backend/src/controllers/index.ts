/*
 ****************************************************************************************************************************
 * Filename    : index
 * Description : Barrel — re-exports all controller functions.
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
