import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, markAdminSession } from '../api/auth'
import { ApiError, NetworkError } from '../api/client'
import AdminLayout from '../components/AdminLayout'

// fm-backend AdminErrorCode 중 로그인 API가 실제로 던지는 코드만 다룬다
const ERROR_MESSAGES: Record<string, string> = {
  'ADMIN-001': '아이디 또는 비밀번호가 올바르지 않습니다.',
  'ADMIN-002': '비활성화된 계정입니다.',
  'ADMIN-011': '로그인 토큰 발급에 실패했습니다. 잠시 후 다시 시도해주세요.',
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code]
    }
    return `요청이 실패했습니다. (status ${error.status})`
  }
  if (error instanceof NetworkError) {
    return '서버에 연결할 수 없습니다.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: () => adminLogin(loginId, password),
    onSuccess: (data) => {
      markAdminSession(data.admin)
      navigate('/admin/coupons')
    },
  })

  return (
    <AdminLayout>
      <div className="mx-auto max-w-sm">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm shadow-gray-900/5">
          <h1 className="text-xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="mt-1 text-sm text-gray-500">쿠폰 백오피스 계정으로 로그인합니다.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              loginMutation.mutate()
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">아이디</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                value={loginId}
                onChange={(event) => {
                  setLoginId(event.target.value)
                  loginMutation.reset()
                }}
                autoComplete="username"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">비밀번호</span>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  loginMutation.reset()
                }}
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!loginId || !password || loginMutation.isPending}
            >
              {loginMutation.isPending ? '로그인 중...' : '로그인'}
            </button>

            {loginMutation.isError && (
              <p className="text-sm text-rose-700">{describeError(loginMutation.error)}</p>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
