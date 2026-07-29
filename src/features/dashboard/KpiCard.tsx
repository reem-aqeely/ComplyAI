import { Info, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/cn'

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  hint,
  infoText,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'gold'
  hint?: string
  /** Optional explanation shown in a small popover next to the label. */
  infoText?: string
}) {
  const toneClasses: Record<string, string> = {
    default: 'bg-[var(--color-brand-navy-50)] text-[var(--color-primary)]',
    success: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]',
    warning: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)]',
    danger: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]',
    gold: 'bg-[var(--color-brand-gold-100)] text-[var(--color-brand-gold-700)]',
  }

  return (
    <Card className="flex items-start gap-4 p-5">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneClasses[tone])}>
        <Icon className="h-5.5 w-5.5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
          {infoText && (
            <Popover>
              <PopoverTrigger
                aria-label={`معلومات عن ${label}`}
                className="rounded-full text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              >
                <Info className="h-3.5 w-3.5" />
              </PopoverTrigger>
              <PopoverContent>{infoText}</PopoverContent>
            </Popover>
          )}
        </div>
        <p className="mt-1 text-2xl font-extrabold text-[var(--color-foreground)]">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">{hint}</p>}
      </div>
    </Card>
  )
}
