import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AnalysisResult,
  Assessment,
  AssessmentStatus,
  AuditEntry,
  ConsultantAction,
  UploadedFileRecord,
} from '@/types/assessment'
import type { ComplianceStatus, Role } from '@/types/common'
import { STORAGE_KEYS } from '@/services/storage/storageKeys'
import { generateId } from '@/utils/id'
import { CONSULTANT_ACTION_LABEL } from '@/utils/status'
import { SEED_DEMO_ASSESSMENTS, buildMockAssessment, buildPendingReviewAssessment } from '@/data/mockAssessment'

const ACTOR_LABEL: Record<Role, string> = {
  client: 'العميل',
  consultant: 'المستشار',
}

interface AssessmentState {
  assessments: Assessment[]
  currentAssessmentId: string | null

  createAssessment: (params: { domainId: string; clientName: string; organizationName: string }) => string
  setCurrentAssessment: (id: string | null) => void

  addFiles: (assessmentId: string, files: UploadedFileRecord[]) => void
  updateFile: (assessmentId: string, fileId: string, patch: Partial<UploadedFileRecord>) => void
  removeFile: (assessmentId: string, fileId: string) => void

  setStatus: (assessmentId: string, status: AssessmentStatus, actor: Role, decisionLabel: string, notes?: string) => void
  setAnalysis: (assessmentId: string, analysis: AnalysisResult) => void

  submitToConsultant: (assessmentId: string) => void

  applyControlDecision: (
    assessmentId: string,
    controlId: string,
    action: ConsultantAction,
    notes: string,
    overriddenStatus?: ComplianceStatus,
    decidedBy?: string,
  ) => void

  requestMoreInfo: (assessmentId: string, notes: string) => void
  escalateAssessment: (assessmentId: string, notes: string) => void
  approveAssessment: (assessmentId: string, notes?: string) => void
  rejectAssessment: (assessmentId: string, notes: string) => void
  issueFinalReport: (assessmentId: string) => void

  addAuditEntry: (assessmentId: string, entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
}

function touch(assessment: Assessment): Assessment {
  return { ...assessment, updatedAt: new Date().toISOString() }
}

function makeAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  return { ...entry, id: generateId('audit'), timestamp: new Date().toISOString() }
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      assessments: [],
      currentAssessmentId: null,

      createAssessment: ({ domainId, clientName, organizationName }) => {
        const id = generateId('assess')
        const now = new Date().toISOString()
        const assessment: Assessment = {
          id,
          frameworkId: 'DGA',
          domainId,
          clientName,
          organizationName,
          createdAt: now,
          updatedAt: now,
          status: 'draft',
          files: [],
          auditTrail: [
            makeAuditEntry({
              actor: 'client',
              actorLabel: ACTOR_LABEL.client,
              decision: 'إنشاء تقييم جديد',
              notes: `تم إنشاء تقييم جديد لجهة: ${organizationName}`,
            }),
          ],
          reportVersion: 0,
        }
        set((state) => ({ assessments: [...state.assessments, assessment], currentAssessmentId: id }))
        return id
      },

      setCurrentAssessment: (id) => set({ currentAssessmentId: id }),

      addFiles: (assessmentId, files) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId ? touch({ ...a, files: [...a.files, ...files] }) : a,
          ),
        })),

      updateFile: (assessmentId, fileId, patch) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? touch({ ...a, files: a.files.map((f) => (f.id === fileId ? { ...f, ...patch } : f)) })
              : a,
          ),
        })),

      removeFile: (assessmentId, fileId) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId ? touch({ ...a, files: a.files.filter((f) => f.id !== fileId) }) : a,
          ),
        })),

      setStatus: (assessmentId, status, actor, decisionLabel, notes) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? touch({
                  ...a,
                  status,
                  auditTrail: [
                    ...a.auditTrail,
                    makeAuditEntry({ actor, actorLabel: ACTOR_LABEL[actor], decision: decisionLabel, notes }),
                  ],
                })
              : a,
          ),
        })),

      setAnalysis: (assessmentId, analysis) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? touch({
                  ...a,
                  analysis,
                  status: 'analyzed',
                  auditTrail: [
                    ...a.auditTrail,
                    makeAuditEntry({
                      actor: 'client',
                      actorLabel: ACTOR_LABEL.client,
                      decision: 'اكتمال تحليل الذكاء الاصطناعي',
                      notes: `نسبة الامتثال المقدَّرة: ${analysis.complianceScore}٪`,
                    }),
                  ],
                })
              : a,
          ),
        })),

      submitToConsultant: (assessmentId) => {
        get().setStatus(assessmentId, 'submitted_to_consultant', 'client', 'إرسال للمستشار')
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId ? { ...a, submittedAt: new Date().toISOString() } : a,
          ),
        }))
      },

      applyControlDecision: (assessmentId, controlId, action, notes, overriddenStatus, decidedBy = 'المستشار') =>
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId || !a.analysis) return a
            const controlFindings = a.analysis.controlFindings.map((f) =>
              f.controlId === controlId
                ? {
                    ...f,
                    status: overriddenStatus ?? f.status,
                    consultantDecision: {
                      action,
                      notes,
                      overriddenStatus,
                      decidedAt: new Date().toISOString(),
                      decidedBy,
                    },
                  }
                : f,
            )
            return touch({
              ...a,
              status: 'under_review',
              analysis: { ...a.analysis, controlFindings },
              auditTrail: [
                ...a.auditTrail,
                makeAuditEntry({
                  actor: 'consultant',
                  actorLabel: ACTOR_LABEL.consultant,
                  decision: CONSULTANT_ACTION_LABEL[action],
                  controlId,
                  notes,
                }),
              ],
            })
          }),
        })),

      requestMoreInfo: (assessmentId, notes) => get().setStatus(assessmentId, 'needs_info', 'consultant', 'طلب معلومات إضافية', notes),
      escalateAssessment: (assessmentId, notes) => get().setStatus(assessmentId, 'escalated', 'consultant', 'تصعيد الحالة', notes),
      approveAssessment: (assessmentId, notes) => get().setStatus(assessmentId, 'approved', 'consultant', 'اعتماد التقييم', notes),
      rejectAssessment: (assessmentId, notes) => get().setStatus(assessmentId, 'rejected', 'consultant', 'رفض التقييم', notes),

      issueFinalReport: (assessmentId) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? touch({
                  ...a,
                  status: 'finalized',
                  finalizedAt: new Date().toISOString(),
                  reportVersion: a.reportVersion + 1,
                  auditTrail: [
                    ...a.auditTrail,
                    makeAuditEntry({
                      actor: 'consultant',
                      actorLabel: ACTOR_LABEL.consultant,
                      decision: 'إصدار التقرير النهائي',
                    }),
                  ],
                })
              : a,
          ),
        })),

      addAuditEntry: (assessmentId, entry) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId ? touch({ ...a, auditTrail: [...a.auditTrail, makeAuditEntry(entry)] }) : a,
          ),
        })),
    }),
    { name: STORAGE_KEYS.assessments },
  ),
)

/** Demo convenience only: called once from the app root (see App.tsx). If
 * seeding is on and nothing has ever been persisted, seeds the sample
 * assessments so neither dashboard starts empty — one finalized record and one
 * awaiting consultant review. Never touches existing/real data. */
export function seedDemoAssessmentsIfEmpty() {
  if (!SEED_DEMO_ASSESSMENTS) return
  if (useAssessmentStore.getState().assessments.length > 0) return
  const pending = buildPendingReviewAssessment()
  useAssessmentStore.setState({
    assessments: [buildMockAssessment(), pending],
    currentAssessmentId: pending.id,
  })
}
