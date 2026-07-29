import { Briefcase, ChevronDown, User } from 'lucide-react'
import { useRoleStore } from '@/hooks/useRoleStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils/cn'

const ROLE_META = {
  client: { label: 'العميل', icon: User },
  consultant: { label: 'المستشار', icon: Briefcase },
} as const

export function RoleSwitcher() {
  const { role, setRole } = useRoleStore()
  const Meta = ROLE_META[role]
  const Icon = Meta.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--color-primary)] shadow-sm transition-colors hover:bg-[var(--color-muted)]"
        >
          <Icon className="h-4 w-4" />
          {Meta.label}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {(Object.keys(ROLE_META) as Array<keyof typeof ROLE_META>).map((key) => {
          const ItemIcon = ROLE_META[key].icon
          return (
            <DropdownMenuItem
              key={key}
              onSelect={() => setRole(key)}
              className={cn('gap-2', role === key && 'bg-[var(--color-muted)] font-semibold')}
            >
              <ItemIcon className="h-4 w-4" />
              الدخول كـ{ROLE_META[key].label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
