import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { memberLogin } from '../api/auth'
import { ApiError, NetworkError } from '../api/client'
import StorefrontLayout from '../components/StorefrontLayout'

// fm-backend AuthErrorCode 중 로그인 완료 API가 실제로 던지는 코드만 다룬다
const ERROR_MESSAGES: Record<string, string> = {
  'AUTH-001': '로그인 요청이 만료되었거나 위조됐습니다. 다시 시도해주세요.',
  'AUTH-002': '카카오 인증 정보 확인에 실패했습니다.',
  'AUTH-003': '카카오 서버로부터 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.',
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

export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  // 카카오 인가 코드는 1회용이라, StrictMode의 effect 두 번 실행 때문에 두 번 보내면 안 된다
  const startedRef = useRef(false)

  const { mutate: login, isPending, isError, error } = useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      memberLogin(code, state, false),
    onSuccess: () => navigate('/coupons/issue'),
  })

  const code = searchParams.get('code')
  const state = searchParams.get('state')

  useEffect(() => {
    if (startedRef.current || !code || !state) return
    startedRef.current = true
    login({ code, state })
  }, [code, state, login])

  return (
    <StorefrontLayout>
      <section className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16 text-center">
        {(!code || !state) && (
          <p className="text-sm text-rose-700">카카오 로그인 정보가 없습니다. 다시 시도해주세요.</p>
        )}
        {isPending && <p className="text-sm text-gray-500">로그인 처리 중...</p>}
        {isError && <p className="text-sm text-rose-700">{describeError(error)}</p>}
      </section>
    </StorefrontLayout>
  )
}
