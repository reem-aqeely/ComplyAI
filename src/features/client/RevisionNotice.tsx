import { AlertTriangle, MessageSquareWarning, UploadCloud, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Assessment } from '@/types/assessment'

export function RevisionNotice({
  assessment,
  onUploadClick,
}: {
  assessment: Assessment
  onUploadClick: () => void
}) {
  const isRejected = assessment.status === 'rejected'
  const isNeedsInfo = assessment.status === 'needs_info'
  if (!isRejected && !isNeedsInfo) return null

  const relevantDecision = isRejected ? 'رفض التقييم' : 'طلب معلومات إضافية'
  const latestNote = [...assessment.auditTrail].reverse().find((e) => e.decision === relevantDecision)?.notes

  const perControlNotes = (assessment.analysis?.controlFindings ?? [])
    .filter((f) => f.consultantDecision && (f.consultantDecision.action === 'request_info' || f.consultantDecision.action === 'reject'))
    .map((f) => ({ controlId: f.controlId, controlText: f.controlText, notes: f.consultantDecision?.notes }))

  return (
    <Card
      className={
        isRejected
          ? 'border-[var(--color-status-danger)]/40 bg-[var(--color-status-danger-bg)]'
          : 'border-[var(--color-status-warning)]/40 bg-[var(--color-status-warning-bg)]'
      }
    >
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <div
            className={
              isRejected
                ? 'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-status-danger)]'
                : 'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-status-warning)]'
            }
          >
            {isRejected ? <XCircle className="h-5 w-5" /> : <MessageSquareWarning className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <p className={isRejected ? 'font-bold text-[var(--color-status-danger)]' : 'font-bold text-[var(--color-status-warning)]'}>
              {isRejected ? 'تم رفض التقييم من قِبل المستشار' : 'المستشار يطلب معلومات إضافية'}
            </p>
            {latestNote && <p className="mt-1.5 text-sm text-[var(--color-foreground)]">{latestNote}</p>}
            {!latestNote && (
              <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
                لم يُضف المستشار ملاحظات عامة على التقييم؛ راجع الملاحظات على الضوابط المحددة أدناه إن وُجدت.
              </p>
            )}
          </div>
        </div>

        {perControlNotes.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-black/5 pt-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-foreground)]">
              <AlertTriangle className="h-4 w-4" />
              ملاحظات على ضوابط محددة
            </p>
            {perControlNotes.map((n) => (
              <div key={n.controlId} className="rounded-lg border border-[var(--color-border)] bg-white p-3 text-sm">
                <p className="font-mono text-xs text-[var(--color-muted-foreground)]">{n.controlId}</p>
                <p className="mt-1 line-clamp-2 text-[var(--color-foreground)]">{n.controlText}</p>
                {n.notes && <p className="mt-1.5 font-medium text-[var(--color-foreground)]">{n.notes}</p>}
              </div>
            ))}
          </div>
        )}

        <Button variant="gold" className="self-start" onClick={onUploadClick}>
          <UploadCloud className="h-4 w-4" />
          رفع مستندات محدثة
        </Button>
      </CardContent>
    </Card>
  )
}
