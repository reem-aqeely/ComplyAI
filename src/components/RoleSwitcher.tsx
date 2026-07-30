import { User } from 'lucide-react'

/**
 * Header role indicator. There is a single role, so this is a static label —
 * the dropdown and its "الدخول كـ…" entries were removed. Styling matches the
 * previous trigger pill exactly, minus the hover/caret affordances that would
 * imply it is still interactive.
 */
export function RoleSwitcher() {
  return (
    <span className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--color-primary)] shadow-sm">
      <User className="h-4 w-4" />
      العميل
    </span>
  )
}
