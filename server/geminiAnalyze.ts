/**
 * Server-side Gemini call. This module must never be imported from `src/` —
 * it runs in Node (Vite dev/preview middleware, or any serverless handler) so
 * the API key stays out of the browser bundle entirely.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { ANALYSIS_RESPONSE_SCHEMA } from '../src/services/gemini/schema'
import { SYSTEM_INSTRUCTION, buildAnalysisPrompt, type DocumentInput } from '../src/services/gemini/prompt'
import type { ControlRecord } from '../src/types/knowledge-base'

export const GEMINI_MODEL = 'gemini-flash-latest'

export interface AnalyzeRequestBody {
  controls: ControlRecord[]
  documents: DocumentInput[]
}

/**
 * dotenv only strips quotes when they are balanced, so a key pasted as
 * `GEMINI_API_KEY=AIza..."` keeps the stray quote and Google rejects it with
 * a 400 API_KEY_INVALID. Trim whitespace and unpaired quotes defensively.
 */
export function normalizeApiKey(raw: string | undefined): string {
  return (raw ?? '').trim().replace(/^["']+/, '').replace(/["']+$/, '').trim()
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function analyze(body: AnalyzeRequestBody, rawApiKey: string | undefined): Promise<unknown> {
  const apiKey = normalizeApiKey(rawApiKey)
  if (!apiKey) {
    throw new ApiError(
      500,
      'مفتاح Gemini API غير مُعرَّف على الخادم. أضِف المتغير GEMINI_API_KEY إلى ملف .env في جذر المشروع ثم أعد تشغيل الخادم.',
    )
  }
  if (!/^AIza[A-Za-z0-9_-]{35}$/.test(apiKey)) {
    throw new ApiError(
      500,
      'قيمة GEMINI_API_KEY غير صالحة الشكل. تأكد من عدم وجود علامات اقتباس أو مسافات زائدة حول المفتاح في ملف .env.',
    )
  }

  const { controls, documents } = body
  if (!Array.isArray(controls) || !Array.isArray(documents)) {
    throw new ApiError(400, 'طلب غير صالح: يجب إرسال controls و documents.')
  }

  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildAnalysisPrompt(controls, documents),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseJsonSchema: ANALYSIS_RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  })

  const text = response.text
  if (!text) throw new ApiError(502, 'لم يُرجع النموذج أي محتوى.')

  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError(502, 'استجابة الذكاء الاصطناعي ليست بصيغة JSON صالحة.')
  }
}

/** Node req/res adapter shared by the Vite dev and preview servers. */
export async function handleAnalyzeRequest(
  req: IncomingMessage,
  res: ServerResponse,
  apiKey: string | undefined,
): Promise<void> {
  const raw = await new Promise<string>((resolve, reject) => {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', (chunk: string) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  try {
    const result = await analyze(JSON.parse(raw) as AnalyzeRequestBody, apiKey)
    res.statusCode = 200
    res.end(JSON.stringify(result))
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502
    const message = error instanceof Error ? error.message : 'تعذر إكمال التحليل.'
    // Surface the upstream reason in the server log, never the key itself.
    console.error('[gemini] analyze failed:', message)
    res.statusCode = status
    res.end(JSON.stringify({ error: message }))
  }
}
