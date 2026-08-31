import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchMyProfile, memberLogout } from '../api/auth'
import { ApiError } from '../api/client'
import { LogoMark } from './Logo'

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['memberProfile'],
    queryFn: ({ signal }) => fetchMyProfile(signal),
    // 로그인 안 한 방문자에게는 401이 정상 응답이라, 그때마다 3번씩 재시도하며 서버를 두드릴
    // 이유가 없다. 네트워크 단절만 재시도 대상으로 남긴다.
    retry: (failureCount, error) => !(error instanceof ApiError) && failureCount < 3,
  })
  const logoutMutation = useMutation({
    mutationFn: memberLogout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberProfile'] })
      navigate('/login')
    },
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
            <div className="flex items-center gap-4 border-l border-gray-200 pl-5">
              {profileQuery.isSuccess ? (
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <span aria-hidden className="text-base leading-none">
                    👤
                  </span>
                  {logoutMutation.isPending
                    ? '로그아웃 중...'
                    : `${profileQuery.data.nickname}님 로그아웃`}
                </button>
              ) : (
                !profileQuery.isPending && (
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <span aria-hidden className="text-base leading-none">
                      👤
                    </span>
                    로그인
                  </Link>
                )
              )}
              <Link
                to="/admin/login"
                className="rounded-full bg-slate-800 px-3.5 py-1.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-slate-700"
              >
                관리자
              </Link>
            </div>
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
