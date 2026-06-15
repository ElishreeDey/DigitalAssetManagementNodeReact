/*
 ****************************************************************************************************************************
 * Filename    : userController
 * Description : Express request handlers for user CRUD operations — delegates logic to UserService.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/userService'
import { MESSAGES } from '../constants/messages'

const userService = new UserService()

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json(user)
  } catch (error) {
    ;(error as Error).message = MESSAGES.USER_CREATE_FAILED_MSG
    next(error)
  }
}

export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getUsers()
    res.status(200).json(users)
  } catch (error) {
    ;(error as Error).message = MESSAGES.USER_FETCH_FAILED_MSG
    next(error)
  }
}

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.getUserById(Number(req.params.id))
    if (!user)
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND_MSG })
    res.status(200).json(user)
  } catch (error) {
    ;(error as Error).message = MESSAGES.USER_FETCH_SINGLE_FAILED_MSG
    next(error)
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.updateUser(Number(req.params.id), req.body)
    if (!user)
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND_MSG })
    res.status(200).json(user)
  } catch (error) {
    ;(error as Error).message = MESSAGES.USER_UPDATE_FAILED_MSG
    next(error)
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await userService.deleteUser(Number(req.params.id))
    if (!deleted)
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND_MSG })
    res.status(200).json({ message: MESSAGES.USER_DELETE_SUCCESS_MSG })
  } catch (error) {
    ;(error as Error).message = MESSAGES.USER_DELETE_FAILED_MSG
    next(error)
  }
}
