import { Link } from 'react-router-dom'
import { FilePlus2, FileStack } from 'lucide-react'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'
import { useRoleStore } from '@/hooks/useRoleStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ASSESSMENT_STATUS_BADGE, ASSESSMENT_STATUS_LABEL } from '@/utils/status'
import { formatDateTime, formatPercent } from '@/utils/format'

export function AssessmentsListPage() {
  const assessments = useAssessmentStore((s) => s.assessments)
  const role = useRoleStore((s) => s.role)

  const sorted = [...assessments].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const visible = role === 'consultant' ? sorted.filter((a) => a.status !== 'draft' && a.status !== 'analyzing') : sorted

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)]">
            {role === 'consultant' ? 'طلبات المراجعة' : 'تقييماتي'}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {role === 'consultant'
              ? 'التقييمات المرسلة من العملاء بانتظار المراجعة أو التي تمت مراجعتها سابقاً'
              : 'جميع تقييمات الامتثال التي قمت بإنشائها'}
          </p>
        </div>
        {role === 'client' && (
          <Link to="/dga">
            <Button variant="gold">
              <FilePlus2 className="h-4 w-4" />
              تقييم جديد
            </Button>
          </Link>
        )}
      </div>

      {visible.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <FileStack className="h-10 w-10 text-[var(--color-muted-foreground)]" />
          <p className="font-semibold text-[var(--color-primary)]">لا توجد تقييمات بعد</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {role === 'consultant' ? 'لم يقم أي عميل بإرسال تقييم للمراجعة حتى الآن.' : 'ابدأ تقييم امتثال جديد من صفحة أطر العمل.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => (
            <Link key={a.id} to={`/assessments/${a.id}`}>
              <Card className="p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-lg)]">
                <CardContent className="flex flex-col gap-3 p-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-[var(--color-primary)]">{a.organizationName}</p>
                    <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
                      مستشاري الالتزام · آخر تحديث {formatDateTime(a.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.analysis && <span className="text-sm font-semibold text-[var(--color-brand-gold-700)]">{formatPercent(a.analysis.complianceScore)}</span>}
                    <Badge variant={ASSESSMENT_STATUS_BADGE[a.status]}>{ASSESSMENT_STATUS_LABEL[a.status]}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
