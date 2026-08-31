import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError, NetworkError } from '../api/client'
import { fetchIssuanceStatus, issueCoupon } from '../api/coupon'
import StorefrontLayout from '../components/StorefrontLayout'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

// fm-backend CouponErrorCode 중 이 화면의 발급/발급현황 API가 실제로 던지는 코드만 다룬다
const ERROR_MESSAGES: Record<string, string> = {
  'COUPON-001': '없는 쿠폰입니다.',
  'COUPON-002': '지금은 발급받을 수 없는 쿠폰입니다.',
  'COUPON-003': '발급 대상 등급이 아닙니다.',
  'COUPON-004': '선착순 발급 대상 쿠폰이 아닙니다.',
  'COUPON-005': '쿠폰이 모두 소진되었습니다.',
  'COUPON-006': '요청이 몰려 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
  'COUPON-012': '지금은 발급 현황을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code]
    }
    if (error.status === 401 || error.status === 403) {
      return '로그인이 필요합니다.'
    }
    return `요청이 실패했습니다. (status ${error.status})`
  }
  if (error instanceof NetworkError) {
    return '서버에 연결할 수 없습니다.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export default function CouponIssuePage() {
  const [searchParams] = useSearchParams()
  const [couponId, setCouponId] = useState(searchParams.get('couponId') ?? '900001')
  const debouncedCouponId = useDebouncedValue(couponId, 300)
  const queryClient = useQueryClient()

  const statusQuery = useQuery({
    queryKey: ['issuanceStatus', debouncedCouponId],
    queryFn: ({ signal }) => fetchIssuanceStatus(debouncedCouponId, signal),
    enabled: debouncedCouponId.length > 0,
    // ApiError(401/403, 503 COUPON-012 등)는 서버가 이미 판단해서 내려준 응답이라 재시도해도
    // 결과가 바뀌지 않는다. 선착순 이벤트로 트래픽이 몰려 백엔드가 503을 던지는 상황에서 기본
    // 재시도(3회)를 그대로 두면 클라이언트마다 이 API에 대한 요청이 3배로 증폭돼 부하를 더
    // 키운다. 진짜 네트워크 단절(NetworkError)만 재시도 대상으로 남긴다.
    retry: (failureCount, error) => !(error instanceof ApiError) && failureCount < 3,
  })
  const issueMutation = useMutation({
    mutationFn: (targetCouponId: string) => issueCoupon(targetCouponId),
    onSuccess: (_data, targetCouponId) => {
      queryClient.invalidateQueries({ queryKey: ['issuanceStatus', targetCouponId] })
    },
  })

  const remainingRatio =
    statusQuery.isSuccess && statusQuery.data.totalQuantity > 0
      ? Math.max(0, Math.min(100, (statusQuery.data.remaining / statusQuery.data.totalQuantity) * 100))
      : null

  return (
    <StorefrontLayout>
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm shadow-brand-900/5">
          <span className="text-xs font-semibold tracking-wide text-accent-600">
            LIMITED · 선착순 발급
          </span>
          <h1 className="mt-1 text-2xl font-bold text-brand-900">쿠폰 받기</h1>
          <p className="mt-1 text-sm text-gray-500">
            쿠폰 ID를 입력하고 서두르세요 — 수량이 소진되면 마감됩니다.
          </p>

          <label className="mt-6 block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">쿠폰 ID</span>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={couponId}
              onChange={(event) => {
                setCouponId(event.target.value)
                issueMutation.reset()
              }}
              inputMode="numeric"
            />
          </label>

          <div className="mt-4 min-h-[3.25rem]">
            {statusQuery.isSuccess && (
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-gray-500">
                    총 {statusQuery.data.totalQuantity}장 중 {statusQuery.data.issuedQuantity}장 발급
                  </span>
                  <span className="font-semibold text-brand-700">
                    {statusQuery.data.remaining}장 남음
                  </span>
                </div>
                {remainingRatio !== null && (
                  <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                      style={{ width: `${remainingRatio}%` }}
                    />
                  </div>
                )}
              </div>
            )}
            {statusQuery.isError && (
              <p className="text-sm text-rose-700">{describeError(statusQuery.error)}</p>
            )}
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-full bg-brand-600 py-3 font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => issueMutation.mutate(couponId)}
            disabled={!couponId || issueMutation.isPending}
          >
            {issueMutation.isPending ? '받는 중...' : '쿠폰 받기'}
          </button>

          {issueMutation.isSuccess && (
            <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-center text-sm font-medium text-brand-700">
              {issueMutation.data.alreadyIssued
                ? `이미 발급받은 쿠폰입니다. (${issueMutation.data.issueSeq}번)`
                : `발급 완료! ${issueMutation.data.issueSeq}번째로 받았습니다.`}
            </p>
          )}
          {issueMutation.isError && (
            <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">
              {describeError(issueMutation.error)}
            </p>
          )}
        </div>
      </section>
    </StorefrontLayout>
  )
}
