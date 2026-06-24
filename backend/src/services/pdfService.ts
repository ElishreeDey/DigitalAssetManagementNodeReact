/*
 ****************************************************************************************************************************
 * Filename    : pdfService
 * Description : PDF processing renders the first page to an image for thumbnail generation.
 *               service is usually called from PDF processing worker to generate thumbnail and store in MinIO.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-23
 ****************************************************************************************************************************
 */

import { MESSAGES } from '../constants'

// pdf to img create only image of 1st page for thumbnail for cur pdf
// scale 2 is good quality thumbnail than scale 1 so using it.
export async function renderFirstPage(filePath: string): Promise<Buffer> {
  try {
    const { pdf } = await import('pdf-to-img')
    const doc = await pdf(filePath, { scale: 2 })

    try {
      return await doc.getPage(1)
    } finally {
      await doc.destroy() // free the memory and delete the temporary img file created for cur PDF.
    }
  } catch (err) {
    throw new Error(
      `${MESSAGES.PDF_THUMBNAIL_FAILED_MSG}: ${(err as Error).message}`,
      { cause: err }
    )
  }
}
