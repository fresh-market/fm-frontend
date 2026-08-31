import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApiError, NetworkError } from '../api/client'
import {
  fetchCouponIssues,
  fetchMemberCouponHistory,
  type MemberCouponStatus,
} from '../api/coupon'
import AdminLayout from '../components/AdminLayout'
import { Badge } from '../components/Badge'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const STATUS_LABELS: Record<MemberCouponStatus, string> = {
  ISSUED: '발급',
  USED: '사용',
  EXPIRED: '만료',
  CANCELED: '취소',
}

const STATUS_TONES: Record<MemberCouponStatus, 'blue' | 'gray' | 'amber' | 'rose'> = {
  ISSUED: 'blue',
  USED: 'gray',
  EXPIRED: 'amber',
  CANCELED: 'rose',
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
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

export default function AdminCouponIssuesPage() {
  const { couponId: couponIdParam } = useParams<{ couponId: string }>()
  const [couponId, setCouponId] = useState(couponIdParam ?? '')
  const debouncedCouponId = useDebouncedValue(couponId, 300)
  const [statusFilter, setStatusFilter] = useState<MemberCouponStatus | undefined>(undefined)
  const [pageToken, setPageToken] = useState<string | undefined>(undefined)
  const [selectedMemberCouponId, setSelectedMemberCouponId] = useState<number | null>(null)

  const issuesQuery = useQuery({
    queryKey: ['couponIssues', debouncedCouponId, statusFilter, pageToken],
    queryFn: ({ signal }) =>
      fetchCouponIssues(debouncedCouponId, { status: statusFilter, pageToken }, signal),
    enabled: debouncedCouponId.length > 0,
  })
  const historyQuery = useQuery({
    queryKey: ['memberCouponHistory', selectedMemberCouponId],
    queryFn: ({ signal }) => fetchMemberCouponHistory(selectedMemberCouponId as number, signal),
    enabled: selectedMemberCouponId !== null,
  })

  function resetToFirstPage() {
    setPageToken(undefined)
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">쿠폰 발급 목록</h1>
        <p className="mt-1 text-sm text-gray-500">쿠폰별 발급 이력과 상태 변화를 조회합니다.</p>
      </div>

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <label className="block space-y-1 text-sm">
          <span className="text-gray-500">쿠폰 ID</span>
          <input
            className="rounded-lg border border-gray-300 px-3 py-1.5 focus:border-brand-500 focus:outline-none"
            value={couponId}
            onChange={(event) => {
              setCouponId(event.target.value)
              resetToFirstPage()
            }}
            inputMode="numeric"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">상태</span>
          <select
            className="rounded-lg border border-gray-300 px-2 py-1.5 focus:border-brand-500 focus:outline-none"
            value={statusFilter ?? ''}
            onChange={(event) => {
              const value = event.target.value
              setStatusFilter(value === '' ? undefined : (value as MemberCouponStatus))
              resetToFirstPage()
            }}
          >
            <option value="">전체</option>
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {issuesQuery.isPending && <p className="text-sm text-gray-500">불러오는 중...</p>}
      {issuesQuery.isError && (
        <p className="text-sm text-rose-700">{describeError(issuesQuery.error)}</p>
      )}

      {issuesQuery.isSuccess && (
        <div className="space-y-3">
          {issuesQuery.data.items.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-400">
              발급 이력이 없습니다.
            </p>
          )}
          {issuesQuery.data.items.map((issue) => (
            <div
              key={issue.memberCouponId}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm shadow-gray-900/5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    회원 {issue.memberId} · 순번 {issue.issueSeq ?? '-'}
                  </span>
                  <Badge tone={STATUS_TONES[issue.status]}>{STATUS_LABELS[issue.status]}</Badge>
                </div>
                <p className="text-gray-500">
                  발급 {issue.issuedAt} {issue.usedAt ? `· 사용 ${issue.usedAt}` : ''}
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-brand-700 hover:text-brand-800"
                onClick={() => setSelectedMemberCouponId(issue.memberCouponId)}
              >
                이력 보기 →
              </button>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            {pageToken !== undefined && (
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                onClick={resetToFirstPage}
              >
                처음부터
              </button>
            )}
            {issuesQuery.data.nextPageToken && (
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                onClick={() => setPageToken(issuesQuery.data.nextPageToken ?? undefined)}
              >
                더보기
              </button>
            )}
          </div>
        </div>
      )}

      {selectedMemberCouponId !== null && (
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">발급분 {selectedMemberCouponId} 상태 이력</h2>
            <button
              type="button"
              className="text-sm text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedMemberCouponId(null)}
            >
              닫기 ✕
            </button>
          </div>
          {historyQuery.isPending && <p className="text-sm text-gray-500">불러오는 중...</p>}
          {historyQuery.isError && (
            <p className="text-sm text-rose-700">{describeError(historyQuery.error)}</p>
          )}
          {historyQuery.isSuccess && (
            <ul className="space-y-2 border-l-2 border-brand-100 pl-4 text-sm">
              {historyQuery.data.history.map((entry, index) => (
                <li key={index} className="relative text-gray-600">
                  <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-brand-500" />
                  <span className="font-medium text-gray-900">
                    {entry.fromStatus ?? '(최초 발급)'} → {entry.toStatus}
                  </span>
                  {entry.reason ? ` · ${entry.reason}` : ''} · {entry.createdAt}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </AdminLayout>
  )
}
