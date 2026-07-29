import { forwardRef, type ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { COMPLIANCE_STATUS_LABEL, PRIORITY_LABEL } from '@/utils/status'
import { formatDate, formatPercent } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Assessment } from '@/types/assessment'

export const ReportDocument = forwardRef<
  HTMLDivElement,
  { assessment: Assessment; variant?: 'capture' | 'preview' }
>(function ReportDocument({ assessment, variant = 'capture' }, ref) {
  const analysis = assessment.analysis
  const isPreview = variant === 'preview'

  return (
    <div
      ref={ref}
      dir="rtl"
      style={{
        width: isPreview ? undefined : 794,
        fontFamily: "'Tajawal', 'IBM Plex Sans Arabic', sans-serif",
      }}
      className={
        isPreview
          ? 'w-full rounded-2xl border border-[var(--color-border)] bg-white p-6 text-[var(--color-foreground)] shadow-[var(--shadow-soft)] sm:p-12'
          : 'bg-white p-12 text-[var(--color-foreground)]'
      }
    >
      {/* Cover */}
      <div className="mb-10 flex items-center justify-between border-b-4 border-[var(--color-brand-gold)] pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-brand-gold)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-[var(--color-primary)]">ComplyAI</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">المستشار الرقمي للامتثال</p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-xs text-[var(--color-muted-foreground)]">تاريخ التقرير</p>
          <p className="text-sm font-semibold">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-[var(--color-primary)]">تقرير تقييم الامتثال</h1>
      <p className="mt-2 text-lg font-semibold text-[var(--color-brand-gold-700)]">{assessment.organizationName}</p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        إطار هيئة الحكومة الرقمية (DGA) — نطاق حوكمة تقنية المعلومات — أُعدّ من قِبل مستشاري الالتزام
      </p>

      {analysis && (
        <>
          <div className={cn('mt-8 grid gap-4', isPreview ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-4')}>
            {[
              { label: 'نسبة الامتثال', value: formatPercent(analysis.complianceScore) },
              { label: 'ضوابط مستوفاة', value: String(analysis.satisfiedCount) },
              { label: 'ضوابط غير مستوفاة', value: String(analysis.unsatisfiedCount) },
              { label: 'درجة الثقة', value: formatPercent(analysis.confidenceScore) },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-brand-bg)] p-4 text-center">
                <p className="text-2xl font-extrabold text-[var(--color-primary)]">{kpi.value}</p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{kpi.label}</p>
              </div>
            ))}
          </div>

          <Section title="الملخص التنفيذي">
            <p className="whitespace-pre-line leading-relaxed">{analysis.executiveSummary}</p>
          </Section>

          {analysis.strengths && analysis.strengths.length > 0 && (
            <Section title="نقاط القوة">
              <ul className="flex flex-col gap-1.5">
                {analysis.strengths.map((item) => (
                  <li key={item} className="leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="تحليل الفجوات">
            <p className="whitespace-pre-line leading-relaxed">{analysis.gapAnalysis}</p>
          </Section>

          <Section title="تقييم الضوابط">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--color-primary)] text-white">
                    <th className="border border-[var(--color-border)] p-2 text-start">رقم الضابط</th>
                    <th className="border border-[var(--color-border)] p-2 text-start">النطاق</th>
                    <th className="border border-[var(--color-border)] p-2 text-start">الحالة</th>
                    <th className="border border-[var(--color-border)] p-2 text-start">الأولوية</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.controlFindings.map((f, i) => (
                    <tr key={f.controlId} className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-brand-bg)]'}>
                      <td className="border border-[var(--color-border)] p-2 font-mono">{f.controlId}</td>
                      <td className="border border-[var(--color-border)] p-2">{f.domainTitle}</td>
                      <td className="border border-[var(--color-border)] p-2">{COMPLIANCE_STATUS_LABEL[f.status]}</td>
                      <td className="border border-[var(--color-border)] p-2">{PRIORITY_LABEL[f.priority]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="التوصيات">
            <div className="flex flex-col gap-3">
              {analysis.recommendations.map((rec) => (
                <div key={rec.id} className="rounded-lg border border-[var(--color-border)] p-3">
                  <p className="font-bold text-[var(--color-primary)]">
                    {rec.title} <span className="font-normal text-[var(--color-muted-foreground)]">({PRIORITY_LABEL[rec.priority]})</span>
                  </p>
                  <p className="mt-1 text-sm">{rec.recommendedAction}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="خطة العمل">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--color-primary)] text-white">
                    <th className="border border-[var(--color-border)] p-2 text-start">الأولوية</th>
                    <th className="border border-[var(--color-border)] p-2 text-start">المهمة</th>
                    <th className="border border-[var(--color-border)] p-2 text-start">المسؤول</th>
                    <th className="border border-[var(--color-border)] p-2 text-start">المدة</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.actionPlan.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-brand-bg)]'}>
                      <td className="border border-[var(--color-border)] p-2">{PRIORITY_LABEL[item.priority]}</td>
                      <td className="border border-[var(--color-border)] p-2">{item.task}</td>
                      <td className="border border-[var(--color-border)] p-2">{item.owner}</td>
                      <td className="border border-[var(--color-border)] p-2">{item.suggestedDuration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      <div className="mt-12 border-t border-[var(--color-border)] pt-4 text-center text-[10px] text-[var(--color-muted-foreground)]">
        هذا التقرير نموذج أولي صادر عن ComplyAI بمساعدة الذكاء الاصطناعي، ويخضع لمراجعة واعتماد مستشار بشري مختص.
      </div>
    </div>
  )
})

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8 break-inside-avoid">
      <h2 className="mb-3 border-b-2 border-[var(--color-brand-gold)] pb-2 text-lg font-bold text-[var(--color-primary)]">
        {title}
      </h2>
      {children}
    </div>
  )
}
