/*
 ****************************************************************************************************************************
 * Filename    : errorMiddleware.test
 * Description : Unit tests for the centralized Express error handler.
 *               Verifies correct HTTP status codes, error message passthrough,
 *               and the fallback message when error.message is empty.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi } from 'vitest'
import { errorMiddleware } from '../../middleware/errorMiddleware'
import { MESSAGES } from '../../constants'

describe('errorMiddleware', () => {
  const mockReq = {} as Parameters<typeof errorMiddleware>[1]
  const mockNext = vi.fn()

  // Creates a fresh mock response for each test so status/json call counts are isolated.
  function makeRes() {
    const res = {
      status: vi.fn(),
      json: vi.fn(),
    }
    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)
    return res as unknown as Parameters<typeof errorMiddleware>[2]
  }

  it('responds with the error status and message when both are present', () => {
    const error = Object.assign(new Error('Not found'), { status: 404 })
    const res = makeRes()
    errorMiddleware(error, mockReq, res, mockNext)
    expect((res as any).status).toHaveBeenCalledWith(404)
    expect((res as any).json).toHaveBeenCalledWith({ message: 'Not found' })
  })

  it('defaults to 500 when the error has no status code', () => {
    const error = new Error('Something broke')
    const res = makeRes()
    errorMiddleware(error, mockReq, res, mockNext)
    expect((res as any).status).toHaveBeenCalledWith(500)
    expect((res as any).json).toHaveBeenCalledWith({
      message: 'Something broke',
    })
  })

  it('uses the fallback message when error.message is empty', () => {
    // Controllers set error.message to a constant
    const error = new Error('')
    const res = makeRes()
    errorMiddleware(error, mockReq, res, mockNext)
    expect((res as any).json).toHaveBeenCalledWith({
      message: MESSAGES.SOMETHING_WENT_WRONG_MSG,
    })
  })

  it('uses custom status from error.status', () => {
    const error = Object.assign(new Error('Forbidden'), { status: 403 })
    const res = makeRes()
    errorMiddleware(error, mockReq, res, mockNext)
    expect((res as any).status).toHaveBeenCalledWith(403)
  })
})
