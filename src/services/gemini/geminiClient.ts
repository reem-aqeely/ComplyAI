import type { GoogleGenAI } from '@google/genai'
import { ANALYSIS_RESPONSE_SCHEMA, type RawGeminiAnalysisResponse } from './schema'
import { SYSTEM_INSTRUCTION, buildAnalysisPrompt, type DocumentInput } from './prompt'
import type { ControlRecord } from '@/types/knowledge-base'

export const GEMINI_MODEL = 'gemini-flash-latest'

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
 * dotenv strips quotes only when they are balanced, so a key pasted as
 * `GEMINI_API_KEY=AIza..."` keeps the stray quote and Gemini rejects it with a
 * 400 API_KEY_INVALID. Trim whitespace and unpaired quotes defensively.
 */
export function normalizeApiKey(raw: string | undefined): string {
  return (raw ?? '').trim().replace(/^["']+/, '').replace(/["']+$/, '').trim()
}

function getApiKey(): string {
  const key = normalizeApiKey(import.meta.env.GEMINI_API_KEY)
  if (!key) throw new GeminiConfigError()
  if (!/^AIza[A-Za-z0-9_-]{35}$/.test(key)) {
    throw new GeminiConfigError(
      'قيمة GEMINI_API_KEY غير صالحة الشكل. تأكد من عدم وجود علامات اقتباس أو مسافات زائدة حول المفتاح في ملف .env ثم أعد تشغيل الخادم.',
    )
  }
  return key
}

let client: GoogleGenAI | null = null
async function getClient(): Promise<GoogleGenAI> {
  if (!client) {
    const { GoogleGenAI } = await import('@google/genai')
    client = new GoogleGenAI({ apiKey: getApiKey() })
  }
  return client
}

/** Pulls the most specific message out of whatever the SDK threw, so the UI
 * shows the real cause (quota, invalid key, safety block…) instead of a
 * generic retry prompt. */
function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  // The SDK embeds the upstream JSON error in the message; surface its text.
  const match = error.message.match(/"message"\s*:\s*"([^"]+)"/)
  return match?.[1] ?? error.message
}

export async function requestComplianceAnalysis(
  controls: ControlRecord[],
  documents: DocumentInput[],
): Promise<RawGeminiAnalysisResponse> {
  const ai = await getClient()
  const prompt = buildAnalysisPrompt(controls, documents)

  let response: Awaited<ReturnType<GoogleGenAI['models']['generateContent']>>
  try {
    response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseJsonSchema: ANALYSIS_RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    })
  } catch (error) {
    // Never swallow the upstream failure — the full object goes to the console
    // and its real message goes to the UI.
    console.error('[gemini] generateContent failed:', error)
    throw new GeminiResponseError(`تعذر إكمال التحليل: ${describeError(error)}`)
  }

  const text = response.text
  if (!text) {
    const finishReason = response.candidates?.[0]?.finishReason
    console.error('[gemini] empty response. finishReason:', finishReason, response)
    throw new GeminiResponseError(
      `لم يُرجع النموذج أي محتوى${finishReason ? ` (السبب: ${finishReason})` : ''}.`,
    )
  }

  try {
    return JSON.parse(text) as RawGeminiAnalysisResponse
  } catch (error) {
    console.error('[gemini] response was not valid JSON:', error, '\nraw text:', text)
    throw new GeminiResponseError('استجابة الذكاء الاصطناعي ليست بصيغة JSON صالحة.')
  }
}
