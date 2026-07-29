import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/utils/format'
import type { AuditEntry } from '@/types/assessment'

export function AuditTrailTable({ entries }: { entries: AuditEntry[] }) {
  const sorted = [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>التاريخ</TableHead>
            <TableHead>القرار</TableHead>
            <TableHead>الضابط</TableHead>
            <TableHead>الملاحظات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                {formatDateTime(entry.timestamp)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{entry.actorLabel}</Badge>
                  <span className="text-sm font-medium">{entry.decision}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-[var(--color-muted-foreground)]">
                {entry.controlId ?? '—'}
              </TableCell>
              <TableCell className="max-w-sm text-sm text-[var(--color-muted-foreground)]">
                {entry.notes ?? '—'}
              </TableCell>
            </TableRow>
          ))}
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-sm text-[var(--color-muted-foreground)]">
                لا توجد سجلات بعد
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
