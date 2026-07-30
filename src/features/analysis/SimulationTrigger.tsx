import { Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'
import type { Assessment } from '@/types/assessment'

/**
 * Demo-only shortcut shown above the upload area. Fills the assessment with a
 * complete simulated analysis without requiring a file or calling Gemini, so
 * the whole experience can be demonstrated instantly.
 */
export function SimulationTrigger({ assessment }: { assessment: Assessment }) {
  const runSimulation = useAssessmentStore((s) => s.runSimulation)

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-start">
        <p className="font-semibold text-[var(--color-primary)]">محاكاة التجربة</p>
        <p className="mt-1 max-w-xl text-sm text-[var(--color-muted-foreground)]">
          لأغراض العرض فقط: استعرض تجربة التقييم كاملة ببيانات تجريبية واقعية دون رفع أي وثيقة ودون استدعاء الذكاء
          الاصطناعي.
        </p>
      </div>
      <Button variant="outline" onClick={() => runSimulation(assessment.id)} className="shrink-0">
        <Wand2 className="h-4 w-4" />
        محاكاة التجربة
      </Button>
    </div>
  )
}
