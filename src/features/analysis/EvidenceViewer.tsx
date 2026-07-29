import { useEffect, useState } from 'react'
import { CheckCircle2, FileSearch, MessageSquareWarning, PenLine, XCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COMPLIANCE_STATUS_BADGE, COMPLIANCE_STATUS_LABEL, PRIORITY_BADGE, PRIORITY_LABEL } from '@/utils/status'
import { formatNumber, formatPercent } from '@/utils/format'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'
import type { ComplianceStatus } from '@/types/common'
import type { ControlFinding } from '@/types/assessment'

export function EvidenceViewer({
  assessmentId,
  finding,
  onOpenChange,
  canReview,
}: {
  assessmentId: string
  finding: ControlFinding | null
  onOpenChange: (open: boolean) => void
  canReview: boolean
}) {
  const applyControlDecision = useAssessmentStore((s) => s.applyControlDecision)
  const [notes, setNotes] = useState('')
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus | undefined>(undefined)

  useEffect(() => {
    setNotes('')
    setOverrideStatus(finding?.status)
  }, [finding])

  if (!finding) return null

  const decision = finding.consultantDecision

  function decide(action: 'approve' | 'modify' | 'reject' | 'request_info') {
    if (!finding) return
    applyControlDecision(
      assessmentId,
      finding.controlId,
      action,
      notes,
      action === 'modify' ? overrideStatus : undefined,
    )
    onOpenChange(false)
  }

  return (
    <Sheet open={Boolean(finding)} onOpenChange={onOpenChange}>
      <SheetContent side="end" className="sm:max-w-lg">
        <SheetHeader>
          <div className="mb-1 flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-[var(--color-brand-gold-600)]" />
            <span className="font-mono text-xs text-[var(--color-muted-foreground)]">{finding.controlId}</span>
          </div>
          <SheetTitle className="leading-snug">{finding.controlText}</SheetTitle>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {finding.levelTitle} — {finding.domainTitle}
          </p>
        </SheetHeader>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={COMPLIANCE_STATUS_BADGE[finding.status]}>{COMPLIANCE_STATUS_LABEL[finding.status]}</Badge>
          <Badge variant={PRIORITY_BADGE[finding.priority]}>أولوية {PRIORITY_LABEL[finding.priority]}</Badge>
          <Badge variant="outline">الثقة {formatPercent(finding.confidence)}</Badge>
        </div>

        <Separator className="my-4" />

        <dl className="flex flex-col gap-4 text-sm">
          <div>
            <dt className="font-semibold text-[var(--color-primary)]">اسم الملف</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">{finding.evidenceRefs[0]?.fileName ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--color-primary)]">الصفحة</dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {finding.evidenceRefs[0]?.page ? formatNumber(finding.evidenceRefs[0].page) : '—'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--color-primary)]">الدليل</dt>
            <dd className="mt-1 whitespace-pre-line rounded-lg bg-[var(--color-muted)] p-3 text-[var(--color-foreground)]">
              {finding.evidence}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--color-primary)]">سبب القرار</dt>
            <dd className="mt-1 whitespace-pre-line text-[var(--color-foreground)]">{finding.reasoning}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--color-primary)]">التوصية</dt>
            <dd className="mt-1 whitespace-pre-line text-[var(--color-foreground)]">{finding.recommendation}</dd>
          </div>
        </dl>

        {decision && (
          <>
            <Separator className="my-4" />
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-brand-navy-50)] p-3 text-sm">
              <p className="font-semibold text-[var(--color-primary)]">قرار المستشار السابق</p>
              <p className="mt-1 text-[var(--color-foreground)]">{decision.notes || 'بدون ملاحظات'}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{decision.decidedBy}</p>
            </div>
          </>
        )}

        {canReview && (
          <>
            <Separator className="my-4" />
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[var(--color-primary)]">إجراء المستشار</p>
              <Select value={overrideStatus} onValueChange={(v) => setOverrideStatus(v as ComplianceStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="تعديل الحالة (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(COMPLIANCE_STATUS_LABEL) as ComplianceStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {COMPLIANCE_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="أضف ملاحظاتك حول هذا الضابط…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="default" onClick={() => decide('approve')}>
                  <CheckCircle2 className="h-4 w-4" />
                  اعتماد
                </Button>
                <Button variant="subtle" onClick={() => decide('modify')}>
                  <PenLine className="h-4 w-4" />
                  تعديل
                </Button>
                <Button variant="destructive" onClick={() => decide('reject')}>
                  <XCircle className="h-4 w-4" />
                  رفض
                </Button>
                <Button variant="outline" onClick={() => decide('request_info')}>
                  <MessageSquareWarning className="h-4 w-4" />
                  طلب معلومات
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
