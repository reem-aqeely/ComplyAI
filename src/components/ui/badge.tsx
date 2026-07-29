import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
        gold: 'border-transparent bg-[var(--color-brand-gold-100)] text-[var(--color-brand-gold-700)]',
        outline: 'border-[var(--color-border)] text-[var(--color-foreground)] bg-transparent',
        success: 'border-transparent bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]',
        warning: 'border-transparent bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)]',
        danger: 'border-transparent bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]',
        critical: 'border-transparent bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical)]',
        info: 'border-transparent bg-[var(--color-status-info-bg)] text-[var(--color-status-info)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
