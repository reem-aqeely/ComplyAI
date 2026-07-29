/** JSON Schema describing the structured response we require from Gemini.
 * Kept separate from types/assessment.ts because it constrains the *raw*
 * model output (keyed to control IDs only) — the service layer enriches
 * it with knowledge-base metadata afterwards. */
export const ANALYSIS_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'complianceScore',
    'confidenceScore',
    'executiveSummary',
    'gapAnalysis',
    'controlFindings',
    'recommendations',
    'actionPlan',
  ],
  properties: {
    complianceScore: { type: 'number', description: 'نسبة الامتثال الإجمالية من 0 إلى 100' },
    confidenceScore: { type: 'number', description: 'درجة ثقة التحليل الإجمالية من 0 إلى 100' },
    executiveSummary: { type: 'string', description: 'ملخص تنفيذي احترافي بالعربية بأسلوب استشاري رفيع المستوى' },
    gapAnalysis: { type: 'string', description: 'تحليل الفجوات بالعربية' },
    controlFindings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['controlId', 'status', 'priority', 'evidence', 'reasoning', 'confidence', 'recommendation'],
        properties: {
          controlId: { type: 'string' },
          status: { type: 'string', enum: ['compliant', 'partially_compliant', 'non_compliant'] },
          priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          evidence: {
            type: 'string',
            description:
              'اقتباس مباشر من الوثيقة يدعم القرار، أو النص الحرفي "لم يتم العثور على دليل يدعم هذا الضابط." إن لم يوجد دليل',
          },
          sourceFileName: { type: 'string' },
          sourcePage: { type: 'number' },
          reasoning: { type: 'string', description: 'سبب القرار بالعربية' },
          confidence: { type: 'number', description: 'درجة الثقة لهذا الضابط من 0 إلى 100' },
          recommendation: { type: 'string' },
        },
      },
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'priority', 'why', 'expectedImpact', 'recommendedAction', 'relatedControlIds'],
        properties: {
          title: { type: 'string' },
          priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          why: { type: 'string' },
          expectedImpact: { type: 'string' },
          recommendedAction: { type: 'string' },
          relatedControlIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    actionPlan: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['task', 'priority', 'owner', 'suggestedDuration', 'relatedControlIds'],
        properties: {
          task: { type: 'string' },
          priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          owner: { type: 'string', description: 'الجهة أو الدور المسؤول عن التنفيذ' },
          suggestedDuration: { type: 'string', description: 'مثال: 30 يوماً، 3 أشهر' },
          relatedControlIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
} as const

export interface RawGeminiFinding {
  controlId: string
  status: 'compliant' | 'partially_compliant' | 'non_compliant'
  priority: 'critical' | 'high' | 'medium' | 'low'
  evidence: string
  sourceFileName?: string
  sourcePage?: number
  reasoning: string
  confidence: number
  recommendation: string
}

export interface RawGeminiRecommendation {
  title: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  why: string
  expectedImpact: string
  recommendedAction: string
  relatedControlIds: string[]
}

export interface RawGeminiActionItem {
  task: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  owner: string
  suggestedDuration: string
  relatedControlIds: string[]
}

export interface RawGeminiAnalysisResponse {
  complianceScore: number
  confidenceScore: number
  executiveSummary: string
  gapAnalysis: string
  controlFindings: RawGeminiFinding[]
  recommendations: RawGeminiRecommendation[]
  actionPlan: RawGeminiActionItem[]
}
