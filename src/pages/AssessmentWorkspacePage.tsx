import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'
import { useRoleStore } from '@/hooks/useRoleStore'
import { WorkflowTimeline } from '@/features/shared/WorkflowTimeline'
import { FileUploader, ClearFilesHint } from '@/features/client/FileUploader'
import { RevisionNotice } from '@/features/client/RevisionNotice'
import { AnalysisTrigger } from '@/features/analysis/AnalysisTrigger'
import { ComplianceDashboard } from '@/features/dashboard/ComplianceDashboard'
import { ControlsTable } from '@/features/analysis/ControlsTable'
import { EvidenceViewer } from '@/features/analysis/EvidenceViewer'
import { RecommendationsList } from '@/features/reports/RecommendationsList'
import { ActionPlanTable } from '@/features/reports/ActionPlanTable'
import { ReportGenerator } from '@/features/reports/ReportGenerator'
import { ReportDocument } from '@/features/reports/ReportDocument'
import { ConsultantActionsBar } from '@/features/consultant/ConsultantActionsBar'
import { AuditTrailTable } from '@/features/audit/AuditTrailTable'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ASSESSMENT_STATUS_BADGE, ASSESSMENT_STATUS_LABEL, isConsultantReviewable } from '@/utils/status'
import type { ControlFinding } from '@/types/assessment'

export function AssessmentWorkspacePage() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const assessment = useAssessmentStore((s) => s.assessments.find((a) => a.id === assessmentId))
  const role = useRoleStore((s) => s.role)

  const [tab, setTab] = useState<string>('upload')
  const [selectedFinding, setSelectedFinding] = useState<ControlFinding | null>(null)
  const [autoOpenUpload, setAutoOpenUpload] = useState(false)

  const hasAnalysis = Boolean(assessment?.analysis)
  const activeTab = useMemo(() => (hasAnalysis ? tab : 'upload'), [hasAnalysis, tab])

  if (!assessmentId) return <Navigate to="/assessments" replace />
  if (!assessment) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-lg font-semibold text-[var(--color-primary)]">لم يتم العثور على هذا التقييم</p>
        <Link to="/assessments" className="mt-4 inline-block text-sm text-[var(--color-primary)] underline">
          العودة إلى قائمة التقييمات
        </Link>
      </div>
    )
  }

  // A single role now carries the review capabilities, so control-level review
  // is gated on the assessment status alone rather than on the role.
  const canReviewControls = isConsultantReviewable(assessment.status)
  const canRevise = assessment.status === 'needs_info' || assessment.status === 'rejected'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <Link
          to="/assessments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى التقييمات
        </Link>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-end">
            <h1 className="text-2xl font-extrabold text-[var(--color-primary)]">{assessment.organizationName}</h1>
            <dl className="mt-3 grid grid-cols-1 gap-x-10 gap-y-2.5 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">اسم المستشار</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--color-foreground)]">مستشاري الالتزام</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">نوع التقييم</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--color-foreground)]">حوكمة تقنية المعلومات (DGA)</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">حالة الطلب</dt>
                <dd className="mt-1">
                  <Badge variant={ASSESSMENT_STATUS_BADGE[assessment.status]}>{ASSESSMENT_STATUS_LABEL[assessment.status]}</Badge>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <WorkflowTimeline status={assessment.status} />
      </div>

      {role === 'client' && (
        <RevisionNotice
          assessment={assessment}
          onUploadClick={() => {
            setTab('upload')
            setAutoOpenUpload(true)
          }}
        />
      )}

      <ConsultantActionsBar assessment={assessment} />

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="upload">رفع الملفات</TabsTrigger>
          {hasAnalysis && <TabsTrigger value="overview">نظرة عامة</TabsTrigger>}
          {hasAnalysis && <TabsTrigger value="controls">الضوابط</TabsTrigger>}
          {hasAnalysis && <TabsTrigger value="recommendations">التوصيات</TabsTrigger>}
          {hasAnalysis && <TabsTrigger value="action-plan">خطة العمل</TabsTrigger>}
          {hasAnalysis && <TabsTrigger value="report">التقرير</TabsTrigger>}
          <TabsTrigger value="audit">سجل التدقيق</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="flex flex-col gap-6">
          <FileUploader
            assessmentId={assessment.id}
            disabled={role !== 'client' || (hasAnalysis && !canRevise)}
            autoOpen={autoOpenUpload}
            onAutoOpenHandled={() => setAutoOpenUpload(false)}
          />
          <ClearFilesHint />
          {role === 'client' && (!hasAnalysis || canRevise) && <AnalysisTrigger assessment={assessment} />}
        </TabsContent>

        {hasAnalysis && assessment.analysis && (
          <>
            <TabsContent value="overview">
              <ComplianceDashboard analysis={assessment.analysis} />
            </TabsContent>
            <TabsContent value="controls">
              <ControlsTable findings={assessment.analysis.controlFindings} onSelect={setSelectedFinding} />
            </TabsContent>
            <TabsContent value="recommendations">
              <RecommendationsList recommendations={assessment.analysis.recommendations} />
            </TabsContent>
            <TabsContent value="action-plan">
              <ActionPlanTable items={assessment.analysis.actionPlan} />
            </TabsContent>
            <TabsContent value="report" className="flex flex-col items-start gap-4">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                يتضمن التقرير الملخص التنفيذي، نسبة الامتثال، تحليل الفجوات، تقييم الضوابط، التوصيات، وخطة العمل بصيغة PDF
                جاهزة للمشاركة.
              </p>
              <ReportGenerator assessment={assessment} />
              {(assessment.status === 'approved' || assessment.status === 'finalized') && (
                <ReportDocument assessment={assessment} variant="preview" />
              )}
            </TabsContent>
          </>
        )}

        <TabsContent value="audit">
          <AuditTrailTable entries={assessment.auditTrail} />
        </TabsContent>
      </Tabs>

      <EvidenceViewer
        assessmentId={assessment.id}
        finding={selectedFinding}
        onOpenChange={(open) => !open && setSelectedFinding(null)}
        canReview={canReviewControls}
      />
    </div>
  )
}
