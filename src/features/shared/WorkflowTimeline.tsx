import { Fragment } from 'react'
import { Check, FileUp, ScanSearch, Stamp } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { AssessmentStatus } from '@/types/assessment'

const STEPS = [
  { key: 'upload', label: 'رفع الملفات', icon: FileUp },
  { key: 'analysis', label: 'تحليل الذكاء الاصطناعي', icon: ScanSearch },
  { key: 'review-decision', label: 'مراجعة النتائج واتخاذ القرار', icon: Stamp },
  { key: 'report', label: 'التقرير النهائي', icon: Check },
] as const

function stepIndexForStatus(status: AssessmentStatus): number {
  switch (status) {
    case 'draft':
      return 0
    case 'analyzing':
      return 1
    // Reviewing the results and deciding on them are one step, so every status
    // from "results available" through to a recorded decision maps here.
    case 'analyzed':
    case 'under_review':
    case 'needs_info':
    case 'approved':
    case 'rejected':
    case 'escalated':
      return 2
    case 'finalized':
      return 3
    default:
      return 0
  }
}

/** Horizontal step progress bar for the assessment workflow. Always renders
 * as a single row (icon + connecting line + compact label underneath),
 * regardless of viewport width — it never collapses into a vertical list. */
export function WorkflowTimeline({ status }: { status: AssessmentStatus }) {
  const activeIndex = stepIndexForStatus(status)

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <ol className="flex w-full min-w-[560px] items-start" dir="rtl">
        {STEPS.map((step, index) => {
          const isDone = index < activeIndex
          const isActive = index === activeIndex
          const isLast = index === STEPS.length - 1

          return (
            <Fragment key={step.key}>
              <li className="flex shrink-0 flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-11 sm:w-11',
                    isDone && 'border-[var(--color-brand-gold)] bg-[var(--color-brand-gold)] text-[var(--color-brand-navy-900)]',
                    isActive &&
                      'border-[var(--color-primary)] bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-brand-navy-100)]',
                    !isDone && !isActive && 'border-[var(--color-border)] bg-white text-[var(--color-muted-foreground)]',
                  )}
                >
                  {isDone ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <step.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />}
                </div>
                <span
                  className={cn(
                    'max-w-[72px] text-center text-[10px] font-semibold leading-tight sm:max-w-[110px] sm:text-xs',
                    isDone || isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]',
                  )}
                >
                  {step.label}
                </span>
              </li>

              {!isLast && (
                <div
                  className={cn(
                    'mt-[18px] h-0.5 min-w-3 flex-1 rounded-full transition-colors duration-300 sm:mt-[22px]',
                    isDone ? 'bg-[var(--color-brand-gold)]' : 'bg-[var(--color-border)]',
                  )}
                />
              )}
            </Fragment>
          )
        })}
      </ol>
    </div>
  )
}
