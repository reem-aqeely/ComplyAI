import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { COMPLIANCE_STATUS_BADGE, COMPLIANCE_STATUS_LABEL, PRIORITY_BADGE, PRIORITY_LABEL } from '@/utils/status'
import { formatNumber } from '@/utils/format'
import type { ComplianceStatus, Priority } from '@/types/common'
import type { ControlFinding } from '@/types/assessment'

export function ControlsTable({
  findings,
  onSelect,
}: {
  findings: ControlFinding[]
  onSelect: (finding: ControlFinding) => void
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (priorityFilter !== 'all' && f.priority !== priorityFilter) return false
      if (search.trim()) {
        const q = search.trim()
        if (!f.controlId.includes(q) && !f.controlText.includes(q) && !f.domainTitle.includes(q)) return false
      }
      return true
    })
  }, [findings, statusFilter, priorityFilter, search])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
          <Input
            placeholder="ابحث برقم الضابط أو النص أو النطاق"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pe-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ComplianceStatus | 'all')}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {(Object.keys(COMPLIANCE_STATUS_LABEL) as ComplianceStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {COMPLIANCE_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | 'all')}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="الأولوية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأولويات</SelectItem>
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الضابط</TableHead>
              <TableHead>اسم الضابط</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الأولوية</TableHead>
              <TableHead>الملف</TableHead>
              <TableHead>الصفحة</TableHead>
              <TableHead>التوصية</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((f) => (
              <TableRow key={f.controlId} className="cursor-pointer" onClick={() => onSelect(f)}>
                <TableCell className="font-mono text-xs text-[var(--color-muted-foreground)]">{f.controlId}</TableCell>
                <TableCell className="max-w-xs">
                  <p className="line-clamp-2 text-sm">{f.controlText}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)]">{f.domainTitle}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={COMPLIANCE_STATUS_BADGE[f.status]}>{COMPLIANCE_STATUS_LABEL[f.status]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={PRIORITY_BADGE[f.priority]}>{PRIORITY_LABEL[f.priority]}</Badge>
                </TableCell>
                <TableCell className="text-sm">{f.evidenceRefs[0]?.fileName ?? '—'}</TableCell>
                <TableCell className="text-sm">{f.evidenceRefs[0]?.page ? formatNumber(f.evidenceRefs[0].page) : '—'}</TableCell>
                <TableCell className="max-w-xs">
                  <p className="line-clamp-2 text-sm text-[var(--color-muted-foreground)]">{f.recommendation}</p>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-[var(--color-muted-foreground)]">
                  لا توجد نتائج مطابقة للفلاتر الحالية
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
