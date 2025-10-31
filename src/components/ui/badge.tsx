import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  type?: 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE' | string
  className?: string
}

export function Badge({ children, type, className = '' }: BadgeProps) {
  const palette = getPalette(type)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${palette.background} ${palette.color} ${className}`}
    >
      {children}
    </span>
  )
}

function getPalette(type?: string) {
  switch (type) {
    case 'CLICK':
      return { background: 'bg-red-500/10', color: 'text-red-600' }
    case 'REPORT':
      return { background: 'bg-green-500/10', color: 'text-green-600' }
    case 'OPEN':
      return { background: 'bg-blue-500/10', color: 'text-blue-600' }
    case 'IGNORE':
      return { background: 'bg-gray-500/10', color: 'text-gray-600' }
    default:
      return { background: 'bg-surface-muted', color: 'text-muted' }
  }
}
