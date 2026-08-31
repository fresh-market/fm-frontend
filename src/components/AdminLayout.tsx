import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LogoMark } from './Logo'

const ADMIN_NAV = [
  { to: '/admin/coupons', label: '쿠폰 목록' },
  { to: '/admin/coupon-events', label: '이벤트 제어' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-3">
            <Link to="/">
              <LogoMark className="h-11" />
            </Link>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white">
              BACK OFFICE
            </span>
          </div>
          <Link to="/coupons/issue" className="text-sm text-gray-400 hover:text-gray-600">
            쇼핑몰로 이동
          </Link>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-6">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-gray-500 hover:border-slate-200 hover:text-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  )
}
