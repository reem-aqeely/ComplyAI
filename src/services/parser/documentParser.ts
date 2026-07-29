import { parsePdf, type ParsedDocument } from './pdfParser'
import { parseDocx } from './docxParser'

export type { ParsedDocument }

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

const PARSE_TIMEOUT_MS = 45_000

export function isSupportedFile(file: File): boolean {
  if ((ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) return true
  const name = file.name.toLowerCase()
  return name.endsWith('.pdf') || name.endsWith('.docx')
}

export class DocumentParseTimeoutError extends Error {
  constructor() {
    super('استغرقت معالجة الملف وقتاً طويلاً جداً. جرّب ملفاً أصغر أو أعد تحميل الصفحة والمحاولة مرة أخرى.')
    this.name = 'DocumentParseTimeoutError'
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DocumentParseTimeoutError()), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const name = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')

  const parsed = isPdf ? parsePdf(file) : parseDocx(file)
  return withTimeout(parsed, PARSE_TIMEOUT_MS)
}
