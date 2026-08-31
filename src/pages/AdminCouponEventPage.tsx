import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError, NetworkError } from '../api/client'
import {
  changeIssuePeriod,
  closeCouponEvent,
  openCouponEvent,
  verifyCouponConsistency,
} from '../api/coupon'
import AdminLayout from '../components/AdminLayout'
import { Badge } from '../components/Badge'

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

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm shadow-gray-900/5">
      <h2 className="mb-4 font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  )
}

export default function AdminCouponEventPage() {
  const [searchParams] = useSearchParams()
  const [couponId, setCouponId] = useState(searchParams.get('couponId') ?? '900001')
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
    <AdminLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">쿠폰 이벤트 제어</h1>
          <p className="mt-1 text-sm text-gray-500">선착순 발급 이벤트를 열고 닫고, 발급 기간을 관리합니다.</p>
        </div>
      </div>

      <div className="mb-8 max-w-xs">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">쿠폰 ID</span>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            value={couponId}
            onChange={(event) => {
              setCouponId(event.target.value)
              openMutation.reset()
              closeMutation.reset()
              periodMutation.reset()
              consistencyMutation.reset()
            }}
            inputMode="numeric"
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <SectionCard title="이벤트 열기 / 닫기">
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => openMutation.mutate()}
              disabled={!couponId || openMutation.isPending}
            >
              이벤트 열기
            </button>
            <button
              type="button"
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => closeMutation.mutate()}
              disabled={!couponId || closeMutation.isPending}
            >
              이벤트 닫기
            </button>
          </div>
          <div className="mt-3 space-y-1">
            {openMutation.isSuccess && (
              <p className="text-sm text-brand-700">이벤트를 열었습니다.</p>
            )}
            {openMutation.isError && (
              <p className="text-sm text-rose-700">{describeError(openMutation.error)}</p>
            )}
            {closeMutation.isSuccess && (
              <p className="text-sm text-brand-700">이벤트를 닫았습니다.</p>
            )}
            {closeMutation.isError && (
              <p className="text-sm text-rose-700">{describeError(closeMutation.error)}</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="발급 기간 변경">
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-gray-500">발급 시작</span>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                value={issueStartAt}
                onChange={(event) => setIssueStartAt(event.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-gray-500">발급 종료</span>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                value={issueEndAt}
                onChange={(event) => setIssueEndAt(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => periodMutation.mutate()}
              disabled={!couponId || !issueStartAt || !issueEndAt || periodMutation.isPending}
            >
              발급 기간 변경
            </button>
            {periodMutation.isSuccess && (
              <p className="text-sm text-brand-700">발급 기간을 변경했습니다.</p>
            )}
            {periodMutation.isError && (
              <p className="text-sm text-rose-700">{describeError(periodMutation.error)}</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="정합성 검증">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => consistencyMutation.mutate()}
            disabled={!couponId || consistencyMutation.isPending}
          >
            {consistencyMutation.isPending ? '검증 중...' : '지금 검증하기'}
          </button>
          {consistencyMutation.isSuccess && (
            <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
              <Badge tone={consistencyMutation.data.consistent ? 'green' : 'rose'}>
                {consistencyMutation.data.consistent ? '정합성 이상 없음' : '정합성 어긋남 발견'}
              </Badge>
              <dl className="grid grid-cols-2 gap-y-1 pt-1 text-gray-600">
                <dt>쿠폰이 기억하는 발급 수</dt>
                <dd className="text-right font-medium text-gray-900">
                  {consistencyMutation.data.issuedQuantityOnCoupon}
                </dd>
                <dt>실제 발급 행 수</dt>
                <dd className="text-right font-medium text-gray-900">
                  {consistencyMutation.data.actualIssueCount}
                </dd>
                <dt>중복 발급 회원 수</dt>
                <dd className="text-right font-medium text-gray-900">
                  {consistencyMutation.data.duplicatedMembers}
                </dd>
                <dt>비어있는 순번</dt>
                <dd className="text-right font-medium text-gray-900">
                  {consistencyMutation.data.seqGaps.length === 0
                    ? '없음'
                    : consistencyMutation.data.seqGaps.join(', ')}
                </dd>
              </dl>
            </div>
          )}
          {consistencyMutation.isError && (
            <p className="mt-3 text-sm text-rose-700">{describeError(consistencyMutation.error)}</p>
          )}
        </SectionCard>
      </div>
    </AdminLayout>
  )
}
