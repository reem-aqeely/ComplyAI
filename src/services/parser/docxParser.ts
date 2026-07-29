import type { ParsedDocument } from './pdfParser'

export async function parseDocx(file: File): Promise<ParsedDocument> {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  const approxPageCount = Math.max(1, Math.round(result.value.length / 3000))

  return {
    text: result.value,
    pageCount: approxPageCount,
  }
}
