import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary'
  asChild?: boolean
}

export function Button({ className, variant = 'default', asChild, ...props }: ButtonProps) {
  const Comp = asChild ? 'span' : 'button'
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50'
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  }
  return (
    <Comp className={cn(base, variants[variant], className)} {...props} />
  )
}
