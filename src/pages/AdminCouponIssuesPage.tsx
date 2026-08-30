import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApiError, NetworkError } from '../api/client'
import {
  fetchCouponIssues,
  fetchMemberCouponHistory,
  type MemberCouponStatus,
} from '../api/coupon'

const STATUS_LABELS: Record<MemberCouponStatus, string> = {
  ISSUED: '발급',
  USED: '사용',
  EXPIRED: '만료',
  CANCELED: '취소',
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
  const [couponId, setCouponId] = useState(couponIdParam ?? '900001')
  const [statusFilter, setStatusFilter] = useState<MemberCouponStatus | undefined>(undefined)
  const [pageToken, setPageToken] = useState<string | undefined>(undefined)
  const [selectedMemberCouponId, setSelectedMemberCouponId] = useState<number | null>(null)

  const issuesQuery = useQuery({
    queryKey: ['couponIssues', couponId, statusFilter, pageToken],
    queryFn: () => fetchCouponIssues(couponId, { status: statusFilter, pageToken }),
    enabled: couponId.length > 0,
  })
  const historyQuery = useQuery({
    queryKey: ['memberCouponHistory', selectedMemberCouponId],
    queryFn: () => fetchMemberCouponHistory(selectedMemberCouponId as number),
    enabled: selectedMemberCouponId !== null,
  })

  function resetToFirstPage() {
    setPageToken(undefined)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">쿠폰 발급 목록 (관리자)</h1>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block space-y-1 text-sm">
          <span className="text-gray-600">쿠폰 ID</span>
          <input
            className="rounded border border-gray-300 px-2 py-1"
            value={couponId}
            onChange={(event) => {
              setCouponId(event.target.value)
              resetToFirstPage()
            }}
            inputMode="numeric"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">상태</span>
          <select
            className="rounded border border-gray-300 px-2 py-1"
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
            <p className="text-sm text-gray-500">발급 이력이 없습니다.</p>
          )}
          {issuesQuery.data.items.map((issue) => (
            <div
              key={issue.memberCouponId}
              className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm"
            >
              <div>
                <p>
                  회원 {issue.memberId} · 순번 {issue.issueSeq ?? '-'} ·{' '}
                  <span className="font-medium">{STATUS_LABELS[issue.status]}</span>
                </p>
                <p className="text-gray-500">
                  발급 {issue.issuedAt} {issue.usedAt ? `· 사용 ${issue.usedAt}` : ''}
                </p>
              </div>
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => setSelectedMemberCouponId(issue.memberCouponId)}
              >
                이력 보기
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            {pageToken !== undefined && (
              <button
                type="button"
                className="rounded border border-gray-300 px-3 py-1 text-sm"
                onClick={resetToFirstPage}
              >
                처음부터
              </button>
            )}
            {issuesQuery.data.nextPageToken && (
              <button
                type="button"
                className="rounded border border-gray-300 px-3 py-1 text-sm"
                onClick={() => setPageToken(issuesQuery.data.nextPageToken ?? undefined)}
              >
                더보기
              </button>
            )}
          </div>
        </div>
      )}

      {selectedMemberCouponId !== null && (
        <section className="space-y-2 rounded border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">발급분 {selectedMemberCouponId} 상태 이력</h2>
            <button
              type="button"
              className="text-sm text-gray-500 underline"
              onClick={() => setSelectedMemberCouponId(null)}
            >
              닫기
            </button>
          </div>
          {historyQuery.isPending && <p className="text-sm text-gray-500">불러오는 중...</p>}
          {historyQuery.isError && (
            <p className="text-sm text-rose-700">{describeError(historyQuery.error)}</p>
          )}
          {historyQuery.isSuccess && (
            <ul className="space-y-1 text-sm">
              {historyQuery.data.history.map((entry, index) => (
                <li key={index}>
                  {entry.fromStatus ?? '(최초 발급)'} → {entry.toStatus}
                  {entry.reason ? ` · ${entry.reason}` : ''} · {entry.createdAt}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
