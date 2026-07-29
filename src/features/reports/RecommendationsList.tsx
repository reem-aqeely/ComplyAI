import { Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRIORITY_BADGE, PRIORITY_LABEL } from '@/utils/status'
import type { Priority } from '@/types/common'
import type { Recommendation } from '@/types/assessment'

const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low']

export function RecommendationsList({ recommendations }: { recommendations: Recommendation[] }) {
  const sorted = [...recommendations].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
  )

  if (sorted.length === 0) {
    return <p className="text-sm text-[var(--color-muted-foreground)]">لا توجد توصيات متاحة بعد.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {sorted.map((rec) => (
        <Card key={rec.id}>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-gold-100)] text-[var(--color-brand-gold-700)]">
                <Lightbulb className="h-4.5 w-4.5" />
              </div>
              <CardTitle className="text-base">{rec.title}</CardTitle>
            </div>
            <Badge variant={PRIORITY_BADGE[rec.priority]}>{PRIORITY_LABEL[rec.priority]}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <p className="font-semibold text-[var(--color-primary)]">لماذا</p>
              <p className="mt-0.5 text-[var(--color-foreground)]">{rec.why}</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-primary)]">الأثر المتوقع</p>
              <p className="mt-0.5 text-[var(--color-foreground)]">{rec.expectedImpact}</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-primary)]">الإجراء الموصى به</p>
              <p className="mt-0.5 text-[var(--color-foreground)]">{rec.recommendedAction}</p>
            </div>
            {rec.relatedControlIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {rec.relatedControlIds.map((id) => (
                  <span key={id} className="rounded-full bg-[var(--color-muted)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-muted-foreground)]">
                    {id}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
