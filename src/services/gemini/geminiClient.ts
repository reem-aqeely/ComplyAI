import type { GoogleGenAI } from '@google/genai'
import { ANALYSIS_RESPONSE_SCHEMA, type RawGeminiAnalysisResponse } from './schema'
import { SYSTEM_INSTRUCTION, buildAnalysisPrompt, type DocumentInput } from './prompt'
import type { ControlRecord } from '@/types/knowledge-base'

export const GEMINI_MODEL = 'gemini-flash-latest'

export class GeminiConfigError extends Error {
  constructor() {
    super(
      'مفتاح Gemini API غير مُعرَّف. أضِف المتغير GEMINI_API_KEY إلى ملف .env في جذر المشروع ثم أعد تشغيل الخادم.',
    )
    this.name = 'GeminiConfigError'
  }
}

export class GeminiResponseError extends Error {
  constructor(message = 'تعذر تحليل استجابة الذكاء الاصطناعي. حاول مرة أخرى.') {
    super(message)
    this.name = 'GeminiResponseError'
  }
}

function getApiKey(): string {
  const key = import.meta.env.GEMINI_API_KEY as string | undefined
  if (!key) throw new GeminiConfigError()
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

export async function requestComplianceAnalysis(
  controls: ControlRecord[],
  documents: DocumentInput[],
): Promise<RawGeminiAnalysisResponse> {
  const ai = await getClient()
  const prompt = buildAnalysisPrompt(controls, documents)

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseJsonSchema: ANALYSIS_RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  })

  const text = response.text
  if (!text) throw new GeminiResponseError('لم يُرجع النموذج أي محتوى.')

  try {
    return JSON.parse(text) as RawGeminiAnalysisResponse
  } catch {
    throw new GeminiResponseError('استجابة الذكاء الاصطناعي ليست بصيغة JSON صالحة.')
  }
}
