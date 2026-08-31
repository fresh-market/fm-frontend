import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { memberLogout } from '../api/auth'
import { LogoMark } from './Logo'

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const logoutMutation = useMutation({
    mutationFn: memberLogout,
    onSuccess: () => navigate('/login'),
  })

  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2.5">
          <Link to="/" className="flex items-center">
            <LogoMark className="h-14" />
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/coupons/issue" className="font-medium text-brand-700 hover:text-brand-800">
              쿠폰 받기
            </Link>
            <Link to="/login" className="text-gray-400 hover:text-gray-600">
              로그인
            </Link>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              로그아웃
            </button>
            <Link to="/admin/login" className="text-gray-400 hover:text-gray-600">
              관리자
            </Link>
          </nav>
        </div>
        {logoutMutation.isError && (
          <p className="mx-auto max-w-5xl px-6 pb-2 text-right text-xs text-rose-600">
            로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-brand-100 bg-white py-6 text-center text-xs text-gray-400">
        © 2026 Fresh Market · 신선식품 자사몰
      </footer>
    </div>
  )
}
