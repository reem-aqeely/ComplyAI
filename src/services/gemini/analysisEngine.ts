import { knowledgeBaseService } from '@/services/knowledge-base/knowledgeBaseService'
import { requestComplianceAnalysis } from './geminiClient'
import type { DocumentInput } from './prompt'
import type { FrameworkId } from '@/types/common'
import type { AnalysisResult, ControlFinding, EvidenceRef } from '@/types/assessment'
import { generateId } from '@/utils/id'
import { GEMINI_MODEL } from './geminiClient'
import { MOCK_MODE_ENABLED, buildMockAnalysisResult } from '@/data/mockAssessment'

const NO_EVIDENCE_TEXT = 'لم يتم العثور على دليل يدعم هذا الضابط.'

export interface RunAnalysisParams {
  frameworkId: FrameworkId
  documents: DocumentInput[]
}

/** Simulated latency so the existing "جاري تحليل الوثائق…" loading state still
 * shows briefly in mock mode, instead of resolving instantly. */
const MOCK_ANALYSIS_DELAY_MS = 1200

export async function runComplianceAnalysis({ frameworkId, documents }: RunAnalysisParams): Promise<AnalysisResult> {
  if (MOCK_MODE_ENABLED) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_ANALYSIS_DELAY_MS))
    return { ...buildMockAnalysisResult(), generatedAt: new Date().toISOString() }
  }

  const controls = knowledgeBaseService.getMainControls(frameworkId)
  const raw = await requestComplianceAnalysis(controls, documents)

  const controlFindings: ControlFinding[] = raw.controlFindings.map((f) => {
    const control = knowledgeBaseService.getControlById(frameworkId, f.controlId)
    const hasEvidence = f.evidence && f.evidence.trim() !== '' && !f.evidence.includes(NO_EVIDENCE_TEXT)

    const evidenceRefs: EvidenceRef[] = hasEvidence
      ? [
          {
            fileName: f.sourceFileName ?? documents[0]?.fileName ?? 'غير محدد',
            page: f.sourcePage,
            quote: f.evidence,
          },
        ]
      : []

    return {
      controlId: f.controlId,
      controlText: control?.text ?? '',
      levelId: control?.levelId ?? '',
      levelTitle: control?.levelTitle ?? '',
      domainId: control?.domainId ?? '',
      domainTitle: control?.domainTitle ?? '',
      sourcePage: control?.sourcePage ?? 0,
      status: f.status,
      priority: f.priority,
      evidence: hasEvidence ? f.evidence : NO_EVIDENCE_TEXT,
      evidenceRefs,
      reasoning: f.reasoning,
      confidence: clampScore(f.confidence),
      recommendation: f.recommendation,
    }
  })

  const satisfiedCount = controlFindings.filter((f) => f.status === 'compliant').length
  const partiallySatisfiedCount = controlFindings.filter((f) => f.status === 'partially_compliant').length
  const unsatisfiedCount = controlFindings.filter((f) => f.status === 'non_compliant').length
  const criticalCount = controlFindings.filter((f) => f.priority === 'critical').length

  const computedScore =
    controlFindings.length > 0
      ? ((satisfiedCount + partiallySatisfiedCount * 0.5) / controlFindings.length) * 100
      : 0

  return {
    generatedAt: new Date().toISOString(),
    modelVersion: GEMINI_MODEL,
    complianceScore: clampScore(raw.complianceScore) || Math.round(computedScore),
    confidenceScore: clampScore(raw.confidenceScore),
    satisfiedCount,
    partiallySatisfiedCount,
    unsatisfiedCount,
    criticalCount,
    executiveSummary: raw.executiveSummary,
    gapAnalysis: raw.gapAnalysis,
    controlFindings,
    recommendations: raw.recommendations.map((r) => ({
      id: generateId('rec'),
      priority: r.priority,
      title: r.title,
      why: r.why,
      expectedImpact: r.expectedImpact,
      recommendedAction: r.recommendedAction,
      relatedControlIds: r.relatedControlIds,
    })),
    actionPlan: raw.actionPlan.map((a) => ({
      id: generateId('action'),
      priority: a.priority,
      task: a.task,
      owner: a.owner,
      suggestedDuration: a.suggestedDuration,
      relatedControlIds: a.relatedControlIds,
    })),
  }
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}
