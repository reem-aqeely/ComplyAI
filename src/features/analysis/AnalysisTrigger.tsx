import { useMutation } from '@tanstack/react-query'
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { runComplianceAnalysis } from '@/services/gemini/analysisEngine'
import { useAssessmentStore } from '@/hooks/useAssessmentStore'
import type { Assessment } from '@/types/assessment'

export function AnalysisTrigger({ assessment }: { assessment: Assessment }) {
  const setAnalysis = useAssessmentStore((s) => s.setAnalysis)
  const setStatus = useAssessmentStore((s) => s.setStatus)

  const parsedFiles = assessment.files.filter((f) => f.status === 'parsed' && f.extractedText)
  const canAnalyze = parsedFiles.length > 0
  const isRevision = Boolean(assessment.analysis)
  const canRevise = assessment.status === 'needs_info' || assessment.status === 'rejected'

  const mutation = useMutation({
    mutationFn: async () => {
      setStatus(assessment.id, 'analyzing', 'client', isRevision ? 'إعادة تحليل الامتثال بعد رفع مستندات محدثة' : 'بدء تحليل الامتثال')
      const documents = parsedFiles.map((f) => ({ fileName: f.name, text: f.extractedText ?? '' }))
      return runComplianceAnalysis({ frameworkId: assessment.frameworkId, documents })
    },
    onSuccess: (analysis) => {
      setAnalysis(assessment.id, analysis)
    },
  })

  if (assessment.analysis && !canRevise) return null

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-10 text-center">
      {mutation.isPending ? (
        <>
          <Loader2 className="h-9 w-9 animate-spin text-[var(--color-primary)]" />
          <div>
            <p className="font-semibold text-[var(--color-primary)]">
              {isRevision ? 'جاري إعادة تحليل الوثائق المحدثة…' : 'جاري تحليل الوثائق…'}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              تتم مقارنة الوثائق المرفوعة بضوابط هيئة الحكومة الرقمية عبر Gemini. قد تستغرق العملية دقيقة.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-gold-100)] text-[var(--color-brand-gold-700)]">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-primary)]">
              {isRevision ? 'جاهز لإعادة تحليل التقييم بالمستندات المحدثة' : 'جاهز لبدء تحليل الامتثال'}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--color-muted-foreground)]">
              {canAnalyze
                ? isRevision
                  ? 'سيقوم الذكاء الاصطناعي بإعادة مقارنة جميع الوثائق (السابقة والمحدثة) بضوابط الإطار المختار، وإصدار تقييم جديد يخضع لمراجعة المستشار.'
                  : 'سيقوم الذكاء الاصطناعي بمقارنة الوثائق المرفوعة بجميع ضوابط الإطار المختار، وإصدار تقييم أولي يخضع لمراجعة المستشار.'
                : 'ارفع وثيقة واحدة على الأقل بصيغة PDF أو DOCX وانتظر اكتمال استخراج النص لبدء التحليل.'}
            </p>
          </div>
          <Button size="lg" variant="gold" disabled={!canAnalyze} onClick={() => mutation.mutate()}>
            <Sparkles className="h-4 w-4" />
            {isRevision ? 'إعادة تحليل الامتثال' : 'بدء تحليل الامتثال'}
          </Button>
        </>
      )}

      {mutation.isError && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-[var(--color-status-danger)]/30 bg-[var(--color-status-danger-bg)] px-4 py-3 text-start text-sm text-[var(--color-status-danger)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{mutation.error instanceof Error ? mutation.error.message : 'حدث خطأ غير متوقع أثناء التحليل.'}</span>
        </div>
      )}
    </div>
  )
}
