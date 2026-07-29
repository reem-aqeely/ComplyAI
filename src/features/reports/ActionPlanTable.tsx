import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PRIORITY_BADGE, PRIORITY_LABEL } from '@/utils/status'
import type { Priority } from '@/types/common'
import type { ActionPlanItem } from '@/types/assessment'

const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low']

export function ActionPlanTable({ items }: { items: ActionPlanItem[] }) {
  const sorted = [...items].sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority))

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الأولوية</TableHead>
            <TableHead>المهمة</TableHead>
            <TableHead>المسؤول</TableHead>
            <TableHead>المدة المقترحة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Badge variant={PRIORITY_BADGE[item.priority]}>{PRIORITY_LABEL[item.priority]}</Badge>
              </TableCell>
              <TableCell className="max-w-md">
                <p className="text-sm font-medium">{item.task}</p>
                {item.relatedControlIds.length > 0 && (
                  <p className="mt-1 font-mono text-[11px] text-[var(--color-muted-foreground)]">
                    {item.relatedControlIds.join('، ')}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-sm">{item.owner}</TableCell>
              <TableCell className="text-sm">{item.suggestedDuration}</TableCell>
            </TableRow>
          ))}
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-sm text-[var(--color-muted-foreground)]">
                لا توجد بنود في خطة العمل بعد
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
