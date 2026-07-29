import { NavLink, Outlet } from 'react-router-dom'
import { FileStack, History, LayoutGrid, RefreshCw, ShieldCheck } from 'lucide-react'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { cn } from '@/utils/cn'
import { useRoleStore } from '@/hooks/useRoleStore'

const NAV_ITEMS = [
  { to: '/', label: 'أطر العمل', icon: LayoutGrid, end: true },
  { to: '/assessments', label: 'التقييمات', icon: FileStack },
  { to: '/regulations', label: 'تحديث اللوائح', icon: RefreshCw },
  { to: '/audit', label: 'سجل التدقيق', icon: History },
]

export function AppShell() {
  const role = useRoleStore((s) => s.role)

  return (
    <div className="flex min-h-screen w-full bg-[var(--color-background)]">
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-s border-[var(--color-border)] bg-[var(--color-primary)] text-white lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-gold)] text-[var(--color-brand-navy-900)]">
            <ShieldCheck className="h-5.5 w-5.5" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-none">ComplyAI</p>
            <p className="mt-1 text-[11px] text-white/60">المستشار الرقمي للامتثال</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white',
                  isActive && 'bg-white/10 text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute inset-y-1.5 end-0 w-0.5 rounded-full bg-[var(--color-brand-gold)] transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-brand-gold-200)]">
            الإطار النشط
          </p>
          <p className="mt-1 text-sm font-bold">هيئة الحكومة الرقمية (DGA)</p>
          <p className="mt-0.5 text-[11px] text-white/50">حوكمة تقنية المعلومات — الإصدار 3.0</p>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 px-4 py-3.5 backdrop-blur sm:px-8">
          <div className="lg:hidden">
            <p className="text-base font-extrabold text-[var(--color-primary)]">ComplyAI</p>
          </div>
          <div className="hidden text-sm text-[var(--color-muted-foreground)] lg:block">
            نموذج أولي — تحليل امتثال بمساعدة الذكاء الاصطناعي مع مراجعة بشرية إلزامية
          </div>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>

      <MobileNav currentRole={role} />
    </div>
  )
}

function MobileNav({ currentRole }: { currentRole: string }) {
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--color-border)] bg-white py-2 lg:hidden">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium text-[var(--color-muted-foreground)]',
              isActive && 'text-[var(--color-primary)]',
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
      <span className="sr-only">{currentRole}</span>
    </nav>
  )
}
