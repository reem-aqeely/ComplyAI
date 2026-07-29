import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-[var(--color-brand-gold)]">404</p>
      <p className="text-lg font-semibold text-[var(--color-primary)]">الصفحة غير موجودة</p>
      <Link to="/">
        <Button variant="gold">العودة إلى الرئيسية</Button>
      </Link>
    </div>
  )
}
