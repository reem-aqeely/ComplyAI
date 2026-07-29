import { useMemo } from 'react'
import { AlertOctagon, CheckCircle2, Gauge, ShieldAlert, XCircle } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from './KpiCard'
import { formatPercent } from '@/utils/format'
import type { AnalysisResult } from '@/types/assessment'

const STATUS_COLORS = {
  compliant: '#2f7a4f',
  partially_compliant: '#b5842a',
  non_compliant: '#a53d3d',
}

export function ComplianceDashboard({ analysis }: { analysis: AnalysisResult }) {
  const pieData = useMemo(
    () => [
      { name: 'ممتثل', value: analysis.satisfiedCount, color: STATUS_COLORS.compliant },
      { name: 'ممتثل جزئياً', value: analysis.partiallySatisfiedCount, color: STATUS_COLORS.partially_compliant },
      { name: 'غير ممتثل', value: analysis.unsatisfiedCount, color: STATUS_COLORS.non_compliant },
    ],
    [analysis],
  )

  const domainData = useMemo(() => {
    const byDomain = new Map<string, { domain: string; compliant: number; partial: number; nonCompliant: number }>()
    for (const f of analysis.controlFindings) {
      const entry = byDomain.get(f.domainTitle) ?? { domain: f.domainTitle, compliant: 0, partial: 0, nonCompliant: 0 }
      if (f.status === 'compliant') entry.compliant += 1
      else if (f.status === 'partially_compliant') entry.partial += 1
      else entry.nonCompliant += 1
      byDomain.set(f.domainTitle, entry)
    }
    return Array.from(byDomain.values())
  }, [analysis])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="نسبة الامتثال" value={formatPercent(analysis.complianceScore)} icon={Gauge} tone="gold" />
        <KpiCard label="الضوابط المستوفاة" value={String(analysis.satisfiedCount)} icon={CheckCircle2} tone="success" />
        <KpiCard label="الضوابط غير المستوفاة" value={String(analysis.unsatisfiedCount)} icon={XCircle} tone="danger" />
        <KpiCard label="الضوابط الحرجة" value={String(analysis.criticalCount)} icon={AlertOctagon} tone="warning" />
        <KpiCard
          label="درجة الثقة"
          value={formatPercent(analysis.confidenceScore)}
          icon={ShieldAlert}
          tone="default"
          infoText="تمثل درجة الثقة مدى موثوقية نتائج التحليل، ويتم احتسابها بناءً على اكتمال المستندات، وجودة المحتوى المستخرج، وتوفر الأدلة الداعمة، واعتماد المستشار."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>توزيع حالة الامتثال</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>الامتثال حسب النطاق</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="domain"
                  width={140}
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip />
                <Bar dataKey="compliant" stackId="a" fill={STATUS_COLORS.compliant} name="ممتثل" radius={[0, 4, 4, 0]} />
                <Bar dataKey="partial" stackId="a" fill={STATUS_COLORS.partially_compliant} name="ممتثل جزئياً" />
                <Bar dataKey="nonCompliant" stackId="a" fill={STATUS_COLORS.non_compliant} name="غير ممتثل" radius={[4, 0, 0, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الملخص التنفيذي</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-line leading-relaxed text-[var(--color-foreground)]">
          {analysis.executiveSummary}
        </CardContent>
      </Card>

      {analysis.strengths && analysis.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>نقاط القوة</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {analysis.strengths.map((item) => (
                <li key={item} className="flex items-start gap-2 leading-relaxed text-[var(--color-foreground)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-status-success)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>تحليل الفجوات</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-line leading-relaxed text-[var(--color-foreground)]">
          {analysis.gapAnalysis}
        </CardContent>
      </Card>
    </div>
  )
}
