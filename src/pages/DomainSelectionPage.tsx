import { Link } from 'react-router-dom'
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react'
import { DGA_DOMAINS } from '@/data/frameworks'
import { knowledgeBaseService } from '@/services/knowledge-base/knowledgeBaseService'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'

export function DomainSelectionPage() {
  const meta = knowledgeBaseService.getMeta('DGA')
  const framework = knowledgeBaseService.getFrameworkMeta('DGA')

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى أطر العمل
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-brand-navy-50)] text-[var(--color-primary)]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--color-primary)]">{framework?.name_ar}</h1>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {framework?.authority_ar} — الإصدار {framework?.version}
              </p>
            </div>
          </div>
          {meta && (
            <div className="flex gap-2">
              <Badge variant="gold">{formatNumber(meta.total_controls)} ضابط</Badge>
              <Badge variant="outline">{formatNumber(meta.total_domains)} نطاق</Badge>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--color-primary)]">اختر نطاق التقييم</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DGA_DOMAINS.map((domain) =>
            domain.enabled ? (
              <Link key={domain.id} to="/dga/new">
                <Card className="flex h-full flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-lg)]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[var(--color-status-success-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-status-success)]">
                      متاح
                    </span>
                  </div>
                  <h3 className="font-bold text-[var(--color-primary)]">{domain.titleAr}</h3>
                  <p className="mt-auto text-xs text-[var(--color-muted-foreground)]">ابدأ تقييم امتثال جديد لهذا النطاق</p>
                </Card>
              </Link>
            ) : (
              <Card key={domain.id} className={cn('flex h-full flex-col gap-3 p-5 opacity-60')}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 rounded-full bg-[var(--color-muted)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted-foreground)]">
                    <Lock className="h-3 w-3" />
                    قريبًا
                  </span>
                </div>
                <h3 className="font-bold text-[var(--color-foreground)]">{domain.titleAr}</h3>
              </Card>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
