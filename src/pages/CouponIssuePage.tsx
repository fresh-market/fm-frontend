import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError, NetworkError } from '../api/client'
import { fetchIssuanceStatus, issueCoupon } from '../api/coupon'

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
  const queryClient = useQueryClient()

  const statusQuery = useQuery({
    queryKey: ['issuanceStatus', couponId],
    queryFn: ({ signal }) => fetchIssuanceStatus(couponId, signal),
    enabled: couponId.length > 0,
  })
  const issueMutation = useMutation({
    mutationFn: () => issueCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issuanceStatus', couponId] })
    },
  })

  return (
    <div className="mx-auto max-w-sm space-y-6 p-6">
      <h1 className="text-xl font-semibold">쿠폰 받기</h1>

      <label className="block space-y-1">
        <span className="text-sm text-gray-600">쿠폰 ID</span>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2"
          value={couponId}
          onChange={(event) => setCouponId(event.target.value)}
          inputMode="numeric"
        />
      </label>

      {statusQuery.isSuccess && (
        <p className="text-sm text-gray-600">
          총 {statusQuery.data.totalQuantity}장 중 {statusQuery.data.issuedQuantity}장 발급 ·{' '}
          <span className="font-medium text-gray-900">{statusQuery.data.remaining}장 남음</span>
        </p>
      )}
      {statusQuery.isError && (
        <p className="text-sm text-rose-700">{describeError(statusQuery.error)}</p>
      )}

      <button
        type="button"
        className="w-full rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
        onClick={() => issueMutation.mutate()}
        disabled={!couponId || issueMutation.isPending}
      >
        받기
      </button>

      {issueMutation.isSuccess && (
        <p className="text-sm text-emerald-700">
          {issueMutation.data.alreadyIssued
            ? `이미 발급받은 쿠폰입니다. (${issueMutation.data.issueSeq}번)`
            : `발급 완료! ${issueMutation.data.issueSeq}번째로 받았습니다.`}
        </p>
      )}
      {issueMutation.isError && (
        <p className="text-sm text-rose-700">{describeError(issueMutation.error)}</p>
      )}
    </div>
  )
}
