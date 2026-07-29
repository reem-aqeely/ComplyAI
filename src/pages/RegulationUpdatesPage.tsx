import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Loader2, PlusCircle, PencilLine, MinusCircle, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRegulationStore } from '@/hooks/useRegulationStore'
import { knowledgeBaseService } from '@/services/knowledge-base/knowledgeBaseService'
import { applyRegulationUpdate, checkForRegulationUpdates } from '@/services/regulations/regulationCheckService'
import { formatDateTime } from '@/utils/format'

export function RegulationUpdatesPage() {
  const { lastCheck, appliedVersion, setLastCheck, applyUpdate, dismissUpdate } = useRegulationStore()

  const mutation = useMutation({
    mutationFn: () => checkForRegulationUpdates(appliedVersion),
    onSuccess: (result) => setLastCheck(result),
  })

  function handleApplyUpdate() {
    if (!lastCheck?.newVersion) return
    const updatedKb = applyRegulationUpdate(appliedVersion)
    if (updatedKb) knowledgeBaseService.replaceKnowledgeBase('DGA', updatedKb)
    applyUpdate(lastCheck.newVersion)
  }

  const framework = knowledgeBaseService.getFrameworkMeta('DGA')

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-navy-50)] text-[var(--color-primary)]">
          <RefreshCw className="h-5.5 w-5.5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)]">تحديث اللوائح</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            التحقق من صدور إصدار جديد لضوابط هيئة الحكومة الرقمية
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            الإصدار المعتمد حالياً في قاعدة المعرفة: <Badge variant="gold">{appliedVersion}</Badge>
          </div>
          <Button size="lg" variant="gold" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            التحقق من وجود تحديثات
          </Button>
          {mutation.isPending && (
            <p className="text-xs text-[var(--color-muted-foreground)]">جارٍ الاتصال بمصدر هيئة الحكومة الرقمية…</p>
          )}
        </CardContent>
      </Card>

      {lastCheck && !mutation.isPending && (
        <>
          {!lastCheck.hasUpdate ? (
            <Card className="border-[var(--color-status-success)]/30 bg-[var(--color-status-success-bg)]">
              <CardContent className="flex items-center gap-3 p-6">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-[var(--color-status-success)]" />
                <p className="font-semibold text-[var(--color-status-success)]">
                  قاعدة المعرفة محدثة ولا توجد إصدارات جديدة.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>تحديث متاح</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{lastCheck.currentVersion}</Badge>
                  <span>←</span>
                  <Badge variant="gold">{lastCheck.newVersion}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">آخر تحقق: {formatDateTime(lastCheck.checkedAt)}</p>
                </div>

                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
                    <Sparkles className="h-4 w-4" /> ملخص التغييرات
                  </p>
                  <p className="text-sm leading-relaxed">{lastCheck.summary}</p>
                </div>

                <ChangeGroup icon={PlusCircle} tone="success" title="الضوابط الجديدة" items={lastCheck.newControls} />
                <ChangeGroup icon={PencilLine} tone="warning" title="الضوابط المعدلة" items={lastCheck.modifiedControls} />
                <ChangeGroup icon={MinusCircle} tone="danger" title="الضوابط المحذوفة" items={lastCheck.removedControls} />

                <div>
                  <p className="mb-1.5 text-sm font-semibold text-[var(--color-primary)]">التأثير المتوقع</p>
                  <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{lastCheck.expectedImpact}</p>
                </div>

                <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
                  <Button variant="ghost" onClick={dismissUpdate}>
                    تجاهل
                  </Button>
                  <Button variant="gold" onClick={handleApplyUpdate}>
                    اعتماد التحديث
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {framework && (
        <p className="text-center text-xs text-[var(--color-muted-foreground)]">
          المصدر المرجعي: {framework.authority_ar} — {framework.name_ar}
        </p>
      )}
    </div>
  )
}

function ChangeGroup({
  icon: Icon,
  tone,
  title,
  items,
}: {
  icon: typeof PlusCircle
  tone: 'success' | 'warning' | 'danger'
  title: string
  items?: { controlId: string; domainTitle: string; text: string }[]
}) {
  if (!items || items.length === 0) return null
  const toneClass = {
    success: 'text-[var(--color-status-success)]',
    warning: 'text-[var(--color-status-warning)]',
    danger: 'text-[var(--color-status-danger)]',
  }[tone]

  return (
    <div>
      <p className={`mb-1.5 flex items-center gap-1.5 text-sm font-semibold ${toneClass}`}>
        <Icon className="h-4 w-4" /> {title}
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.controlId} className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
            <p className="font-mono text-xs text-[var(--color-muted-foreground)]">
              {item.controlId} — {item.domainTitle}
            </p>
            <p className="mt-1">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
