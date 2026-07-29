import type { ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Landmark, Lock, Network, ShieldAlert, ShieldCheck, Trophy } from 'lucide-react'
import { FRAMEWORKS } from '@/data/frameworks'
import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import type { FrameworkId } from '@/types/common'

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  landmark: Landmark,
  'shield-check': ShieldCheck,
  'shield-alert': ShieldAlert,
  'badge-check': BadgeCheck,
  network: Network,
  trophy: Trophy,
}

export function FrameworkSelectionPage() {
  const navigate = useNavigate()

  function handleSelect(id: FrameworkId, enabled: boolean) {
    if (!enabled) return
    if (id === 'DGA') navigate('/dga')
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-gold-600)]">ComplyAI</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--color-primary)] sm:text-4xl">
          اختر إطار الحوكمة والامتثال
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
          يبدأ التقييم باختيار الإطار التنظيمي المرجعي. تدعم النسخة الحالية إطار هيئة الحكومة الرقمية، وسيتم إضافة
          الأطر الأخرى تباعاً دون أي تغيير في محرك التحليل.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FRAMEWORKS.map((fw) => {
          const Icon = ICONS[fw.icon] ?? Landmark
          return (
            <Card
              key={fw.id}
              onClick={() => handleSelect(fw.id, fw.enabled)}
              className={cn(
                'group relative flex flex-col gap-4 p-6 transition-all',
                fw.enabled
                  ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-lg)]'
                  : 'cursor-not-allowed opacity-70',
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    fw.enabled
                      ? 'bg-[var(--color-brand-navy-50)] text-[var(--color-primary)]'
                      : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                {!fw.enabled && (
                  <span className="flex items-center gap-1 rounded-full bg-[var(--color-muted)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted-foreground)]">
                    <Lock className="h-3 w-3" />
                    قريباً
                  </span>
                )}
                {fw.enabled && (
                  <span className="rounded-full bg-[var(--color-status-success-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-status-success)]">
                    متاح الآن
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-primary)]">{fw.nameAr}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{fw.authorityAr}</p>
              </div>
              {!fw.enabled && (
                <p className="mt-auto text-xs font-medium text-[var(--color-brand-gold-700)]">سيتم دعمها مستقبلاً</p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
