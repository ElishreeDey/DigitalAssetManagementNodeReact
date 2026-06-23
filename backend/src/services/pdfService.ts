/*
 ****************************************************************************************************************************
 * Filename    : pdfService
 * Description : PDF processing renders the first page to an image for thumbnail generation.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-23
 ****************************************************************************************************************************
 */

import { MESSAGES } from '../constants'

// pdf-to-img render only 1st page of pdf
export async function renderFirstPage(filePath: string): Promise<Buffer> {
  try {
    const { pdf } = await import('pdf-to-img')
    const doc = await pdf(filePath, { scale: 2 })

    try {
      return await doc.getPage(1)
    } finally {
      await doc.destroy()
    }
  } catch (err) {
    throw new Error(
      `${MESSAGES.PDF_THUMBNAIL_FAILED_MSG}: ${(err as Error).message}`,
      { cause: err }
    )
  }
}
