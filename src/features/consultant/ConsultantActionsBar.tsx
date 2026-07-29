import { useState } from 'react'
import { AlertTriangle, CheckCircle2, MessageSquareWarning, Stamp, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'
import { isConsultantReviewable } from '@/utils/status'
import type { Assessment } from '@/types/assessment'

type DialogAction = 'request_info' | 'escalate' | 'approve' | 'reject' | null

const DIALOG_META: Record<Exclude<DialogAction, null>, { title: string; description: string; confirmLabel: string }> = {
  request_info: {
    title: 'طلب معلومات إضافية من العميل',
    description: 'وضّح المعلومات أو المستندات الناقصة المطلوبة لإكمال المراجعة.',
    confirmLabel: 'إرسال الطلب',
  },
  escalate: {
    title: 'تصعيد الحالة',
    description: 'اشرح سبب التصعيد والجهة المقترحة لاتخاذ القرار.',
    confirmLabel: 'تصعيد',
  },
  approve: {
    title: 'اعتماد التقييم النهائي',
    description: 'تأكيد اعتماد نتائج التقييم كما هي بعد مراجعة جميع الضوابط.',
    confirmLabel: 'تأكيد الاعتماد',
  },
  reject: {
    title: 'رفض التقييم',
    description: 'وضّح سبب رفض التقييم الحالي.',
    confirmLabel: 'تأكيد الرفض',
  },
}

export function ConsultantActionsBar({ assessment }: { assessment: Assessment }) {
  const requestMoreInfo = useAssessmentStore((s) => s.requestMoreInfo)
  const escalateAssessment = useAssessmentStore((s) => s.escalateAssessment)
  const approveAssessment = useAssessmentStore((s) => s.approveAssessment)
  const rejectAssessment = useAssessmentStore((s) => s.rejectAssessment)
  const issueFinalReport = useAssessmentStore((s) => s.issueFinalReport)

  const [dialogAction, setDialogAction] = useState<DialogAction>(null)
  const [notes, setNotes] = useState('')

  const canReview = isConsultantReviewable(assessment.status)
  const canFinalize = assessment.status === 'approved'

  function confirm() {
    if (!dialogAction) return
    if (dialogAction === 'request_info') requestMoreInfo(assessment.id, notes)
    if (dialogAction === 'escalate') escalateAssessment(assessment.id, notes)
    if (dialogAction === 'approve') approveAssessment(assessment.id, notes)
    if (dialogAction === 'reject') rejectAssessment(assessment.id, notes)
    setDialogAction(null)
    setNotes('')
  }

  // Nothing actionable in this status (draft, analyzing, analyzed, finalized) —
  // render nothing rather than an empty toolbar with a heading and no buttons.
  if (!canReview && !canFinalize) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white p-4">
      <span className="me-auto text-sm font-semibold text-[var(--color-primary)]">إجراءات المستشار على التقييم</span>
      {canReview && (
        <>
          <Button variant="outline" size="sm" onClick={() => setDialogAction('request_info')}>
            <MessageSquareWarning className="h-4 w-4" />
            طلب معلومات إضافية
          </Button>
          <Button variant="subtle" size="sm" onClick={() => setDialogAction('escalate')}>
            <AlertTriangle className="h-4 w-4" />
            تصعيد الحالة
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDialogAction('reject')}>
            <XCircle className="h-4 w-4" />
            رفض التقييم
          </Button>
          <Button variant="default" size="sm" onClick={() => setDialogAction('approve')}>
            <CheckCircle2 className="h-4 w-4" />
            اعتماد التقييم
          </Button>
        </>
      )}
      {canFinalize && (
        <Button variant="gold" size="sm" onClick={() => issueFinalReport(assessment.id)}>
          <Stamp className="h-4 w-4" />
          إصدار التقرير النهائي
        </Button>
      )}

      <Dialog open={dialogAction !== null} onOpenChange={(open) => !open && setDialogAction(null)}>
        <DialogContent>
          {dialogAction && (
            <>
              <DialogHeader>
                <DialogTitle>{DIALOG_META[dialogAction].title}</DialogTitle>
                <DialogDescription>{DIALOG_META[dialogAction].description}</DialogDescription>
              </DialogHeader>
              <Textarea
                autoFocus
                placeholder="أضف ملاحظاتك…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogAction(null)}>
                  إلغاء
                </Button>
                <Button variant="gold" onClick={confirm}>
                  {DIALOG_META[dialogAction].confirmLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
