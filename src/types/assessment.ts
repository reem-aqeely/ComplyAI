import type { ComplianceStatus, Priority, Role } from './common'

export type UploadedFileStatus = 'queued' | 'parsing' | 'parsed' | 'failed'

export interface UploadedFileRecord {
  id: string
  name: string
  size: number
  mimeType: string
  status: UploadedFileStatus
  extractedText?: string
  pageCount?: number
  error?: string
  uploadedAt: string
}

export interface EvidenceRef {
  fileName: string
  page?: number
  quote?: string
}

export type ConsultantAction = 'approve' | 'modify' | 'reject' | 'request_info' | 'escalate'

export interface ConsultantDecision {
  action: ConsultantAction
  notes: string
  overriddenStatus?: ComplianceStatus
  decidedAt: string
  decidedBy: string
}

export interface ControlFinding {
  controlId: string
  controlText: string
  levelId: string
  levelTitle: string
  domainId: string
  domainTitle: string
  sourcePage: number
  status: ComplianceStatus
  priority: Priority
  evidence: string
  evidenceRefs: EvidenceRef[]
  reasoning: string
  confidence: number
  recommendation: string
  consultantDecision?: ConsultantDecision
}

export interface Recommendation {
  id: string
  priority: Priority
  title: string
  why: string
  expectedImpact: string
  recommendedAction: string
  relatedControlIds: string[]
}

export interface ActionPlanItem {
  id: string
  priority: Priority
  task: string
  owner: string
  suggestedDuration: string
  relatedControlIds: string[]
}

export interface AnalysisResult {
  generatedAt: string
  modelVersion: string
  complianceScore: number
  confidenceScore: number
  satisfiedCount: number
  partiallySatisfiedCount: number
  unsatisfiedCount: number
  criticalCount: number
  executiveSummary: string
  /** Optional — highlights of what the organization already does well. Rendered
   * alongside the executive summary when present; omitted otherwise. */
  strengths?: string[]
  gapAnalysis: string
  controlFindings: ControlFinding[]
  recommendations: Recommendation[]
  actionPlan: ActionPlanItem[]
}

export type AssessmentStatus =
  | 'draft'
  | 'analyzing'
  | 'analyzed'
  | 'under_review'
  | 'needs_info'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'finalized'

export interface AuditEntry {
  id: string
  timestamp: string
  actor: Role | 'النظام'
  actorLabel: string
  decision: string
  controlId?: string
  notes?: string
}

export interface Assessment {
  id: string
  frameworkId: 'DGA'
  domainId: string
  clientName: string
  organizationName: string
  createdAt: string
  updatedAt: string
  status: AssessmentStatus
  files: UploadedFileRecord[]
  analysis?: AnalysisResult
  auditTrail: AuditEntry[]
  finalizedAt?: string
  reportVersion: number
  /** True when the analysis was produced by the demo simulation
   * ("محاكاة التجربة") rather than a real Gemini run. Internal marker only. */
  isSimulation?: boolean
}
