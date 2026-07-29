import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'
import { AuditTrailTable } from '@/features/audit/AuditTrailTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AuditEntry } from '@/types/assessment'

export function AuditLogPage() {
  const assessments = useAssessmentStore((s) => s.assessments)
  const [selectedId, setSelectedId] = useState<string>('all')

  const entries: (AuditEntry & { organizationName: string })[] = useMemo(() => {
    const pool = selectedId === 'all' ? assessments : assessments.filter((a) => a.id === selectedId)
    return pool.flatMap((a) => a.auditTrail.map((e) => ({ ...e, organizationName: a.organizationName })))
  }, [assessments, selectedId])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-navy-50)] text-[var(--color-primary)]">
          <History className="h-5.5 w-5.5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)]">سجل التدقيق</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">سجل كامل لكل قرار اتُّخذ عبر جميع التقييمات</p>
        </div>
      </div>

      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="sm:w-72">
          <SelectValue placeholder="كل التقييمات" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل التقييمات</SelectItem>
          {assessments.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.organizationName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AuditTrailTable entries={entries} />
    </div>
  )
}
