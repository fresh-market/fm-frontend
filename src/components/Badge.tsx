import type { ReactNode } from 'react'

const TONES = {
  green: 'bg-brand-100 text-brand-700',
  gray: 'bg-gray-100 text-gray-500',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  blue: 'bg-sky-100 text-sky-700',
} as const

export function Badge({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  )
}
