import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError, NetworkError } from '../api/client'
import {
  changeIssuePeriod,
  closeCouponEvent,
  openCouponEvent,
  verifyCouponConsistency,
} from '../api/coupon'

// fm-backend CouponErrorCode 중 이 화면의 세 API(open/close/issue-period)가 실제로 던지는 코드만 다룬다
const ERROR_MESSAGES: Record<string, string> = {
  'COUPON-001': '없는 쿠폰입니다.',
  'COUPON-004': '선착순 발급 대상 쿠폰이 아닙니다.',
  'COUPON-007': '이미 시작한 이벤트라 발급 시각을 바꿀 수 없습니다.',
  'COUPON-008': '마감 시각에서 60초가 지나야 종료할 수 있습니다.',
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code]
    }
    if (error.status === 401 || error.status === 403) {
      return '관리자 로그인이 필요합니다.'
    }
    return `요청이 실패했습니다. (status ${error.status})`
  }
  if (error instanceof NetworkError) {
    return '서버에 연결할 수 없습니다.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export default function AdminCouponEventPage() {
  const [couponId, setCouponId] = useState('900001')
  const [issueStartAt, setIssueStartAt] = useState('')
  const [issueEndAt, setIssueEndAt] = useState('')

  const openMutation = useMutation({ mutationFn: () => openCouponEvent(couponId) })
  const closeMutation = useMutation({ mutationFn: () => closeCouponEvent(couponId) })
  const periodMutation = useMutation({
    mutationFn: () => changeIssuePeriod(couponId, { issueStartAt, issueEndAt }),
  })
  const consistencyMutation = useMutation({
    mutationFn: () => verifyCouponConsistency(couponId),
  })

  return (
    <div className="mx-auto max-w-md space-y-8 p-6">
      <h1 className="text-xl font-semibold">쿠폰 이벤트 제어 (관리자)</h1>

      <label className="block space-y-1">
        <span className="text-sm text-gray-600">쿠폰 ID</span>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2"
          value={couponId}
          onChange={(event) => setCouponId(event.target.value)}
          inputMode="numeric"
        />
      </label>

      <section className="space-y-2">
        <h2 className="font-medium">이벤트 열기 / 닫기</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={() => openMutation.mutate()}
            disabled={!couponId || openMutation.isPending}
          >
            이벤트 열기
          </button>
          <button
            type="button"
            className="rounded bg-rose-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={() => closeMutation.mutate()}
            disabled={!couponId || closeMutation.isPending}
          >
            이벤트 닫기
          </button>
        </div>
        {openMutation.isSuccess && (
          <p className="text-sm text-emerald-700">이벤트를 열었습니다.</p>
        )}
        {openMutation.isError && (
          <p className="text-sm text-rose-700">{describeError(openMutation.error)}</p>
        )}
        {closeMutation.isSuccess && (
          <p className="text-sm text-emerald-700">이벤트를 닫았습니다.</p>
        )}
        {closeMutation.isError && (
          <p className="text-sm text-rose-700">{describeError(closeMutation.error)}</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">발급 기간 변경</h2>
        <label className="block space-y-1">
          <span className="text-sm text-gray-600">발급 시작</span>
          <input
            type="datetime-local"
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={issueStartAt}
            onChange={(event) => setIssueStartAt(event.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-gray-600">발급 종료</span>
          <input
            type="datetime-local"
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={issueEndAt}
            onChange={(event) => setIssueEndAt(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={() => periodMutation.mutate()}
          disabled={!couponId || !issueStartAt || !issueEndAt || periodMutation.isPending}
        >
          발급 기간 변경
        </button>
        {periodMutation.isSuccess && (
          <p className="text-sm text-emerald-700">발급 기간을 변경했습니다.</p>
        )}
        {periodMutation.isError && (
          <p className="text-sm text-rose-700">{describeError(periodMutation.error)}</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">정합성 검증</h2>
        <button
          type="button"
          className="rounded bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={() => consistencyMutation.mutate()}
          disabled={!couponId || consistencyMutation.isPending}
        >
          지금 검증하기
        </button>
        {consistencyMutation.isSuccess && (
          <div className="space-y-1 rounded border border-gray-200 p-3 text-sm">
            <p className={consistencyMutation.data.consistent ? 'text-emerald-700' : 'text-rose-700'}>
              {consistencyMutation.data.consistent ? '정합성 이상 없음' : '정합성 어긋남 발견'}
            </p>
            <p>쿠폰이 기억하는 발급 수: {consistencyMutation.data.issuedQuantityOnCoupon}</p>
            <p>실제 발급 행 수: {consistencyMutation.data.actualIssueCount}</p>
            <p>중복 발급 회원 수: {consistencyMutation.data.duplicatedMembers}</p>
            <p>
              비어있는 순번:{' '}
              {consistencyMutation.data.seqGaps.length === 0
                ? '없음'
                : consistencyMutation.data.seqGaps.join(', ')}
            </p>
          </div>
        )}
        {consistencyMutation.isError && (
          <p className="text-sm text-rose-700">{describeError(consistencyMutation.error)}</p>
        )}
      </section>
    </div>
  )
}
