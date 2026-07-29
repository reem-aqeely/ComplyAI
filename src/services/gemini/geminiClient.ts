import type { RawGeminiAnalysisResponse } from './schema'
import type { DocumentInput } from './prompt'
import type { ControlRecord } from '@/types/knowledge-base'

export const GEMINI_MODEL = 'gemini-flash-latest'

/** Server route that holds the API key. See server/geminiAnalyze.ts. */
const ANALYZE_ROUTE = '/api/gemini/analyze'

export class GeminiConfigError extends Error {
  constructor(
    message = 'مفتاح Gemini API غير مُعرَّف. أضِف المتغير GEMINI_API_KEY إلى ملف .env في جذر المشروع ثم أعد تشغيل الخادم.',
  ) {
    super(message)
    this.name = 'GeminiConfigError'
  }
}

export class GeminiResponseError extends Error {
  constructor(message = 'تعذر تحليل استجابة الذكاء الاصطناعي. حاول مرة أخرى.') {
    super(message)
    this.name = 'GeminiResponseError'
  }
}

/**
 * Posts the controls and extracted document text to the server, which owns the
 * API key and performs the Gemini call. The browser never sees the key.
 */
export async function requestComplianceAnalysis(
  controls: ControlRecord[],
  documents: DocumentInput[],
): Promise<RawGeminiAnalysisResponse> {
  let response: Response
  try {
    response = await fetch(ANALYZE_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ controls, documents }),
    })
  } catch {
    throw new GeminiResponseError('تعذر الاتصال بخادم التحليل. تأكد من تشغيل الخادم ثم حاول مرة أخرى.')
  }

  if (!response.ok) {
    const message = await response
      .json()
      .then((body: { error?: string }) => body?.error)
      .catch(() => undefined)
    // 500 from this route means the server has no usable key configured.
    if (response.status === 500) throw new GeminiConfigError(message)
    throw new GeminiResponseError(message ?? 'تعذر إكمال التحليل. حاول مرة أخرى.')
  }

  try {
    return (await response.json()) as RawGeminiAnalysisResponse
  } catch {
    throw new GeminiResponseError('استجابة الذكاء الاصطناعي ليست بصيغة JSON صالحة.')
  }
}
