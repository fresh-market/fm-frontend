import { useMutation } from '@tanstack/react-query'
import { ApiError, NetworkError } from '../api/client'
import { fetchKakaoAuthorizeUrl } from '../api/auth'
import StorefrontLayout from '../components/StorefrontLayout'

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    return `요청이 실패했습니다. (status ${error.status})`
  }
  if (error instanceof NetworkError) {
    return '서버에 연결할 수 없습니다.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export default function MemberLoginPage() {
  const authorizeMutation = useMutation({
    mutationFn: () => fetchKakaoAuthorizeUrl(),
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl
    },
  })

  return (
    <StorefrontLayout>
      <section className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-sm shadow-brand-900/5">
          <h1 className="text-2xl font-bold text-brand-900">로그인</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fresh Market은 카카오 계정으로 로그인합니다.
          </p>

          <button
            type="button"
            className="mt-6 w-full rounded-full bg-[#FEE500] py-3 font-semibold text-[#191919] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => authorizeMutation.mutate()}
            disabled={authorizeMutation.isPending}
          >
            {authorizeMutation.isPending ? '이동 중...' : '카카오로 로그인'}
          </button>

          {authorizeMutation.isError && (
            <p className="mt-4 text-sm text-rose-700">{describeError(authorizeMutation.error)}</p>
          )}
        </div>
      </section>
    </StorefrontLayout>
  )
}
