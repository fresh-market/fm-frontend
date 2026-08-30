import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, NetworkError } from '../api/client'
import { fetchAdminCoupons } from '../api/coupon'

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

export default function AdminCouponListPage() {
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [scopeFilter, setScopeFilter] = useState<string | undefined>(undefined)
  const [pageToken, setPageToken] = useState<string | undefined>(undefined)

  const query = useQuery({
    queryKey: ['adminCoupons', isActiveFilter, scopeFilter, pageToken],
    queryFn: () =>
      fetchAdminCoupons({ isActive: isActiveFilter, scope: scopeFilter, pageToken }),
  })

  function resetToFirstPage() {
    setPageToken(undefined)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">쿠폰 목록 (관리자)</h1>

      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">활성 여부</span>
          <select
            className="rounded border border-gray-300 px-2 py-1"
            value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
            onChange={(event) => {
              const value = event.target.value
              setIsActiveFilter(value === '' ? undefined : value === 'true')
              resetToFirstPage()
            }}
          >
            <option value="">전체</option>
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">적용 범위</span>
          <select
            className="rounded border border-gray-300 px-2 py-1"
            value={scopeFilter ?? ''}
            onChange={(event) => {
              const value = event.target.value
              setScopeFilter(value === '' ? undefined : value)
              resetToFirstPage()
            }}
          >
            <option value="">전체</option>
            <option value="ORDER">ORDER</option>
            <option value="ITEM">ITEM</option>
          </select>
        </label>
      </div>

      {query.isPending && <p className="text-sm text-gray-500">불러오는 중...</p>}
      {query.isError && <p className="text-sm text-rose-700">{describeError(query.error)}</p>}

      {query.isSuccess && (
        <div className="space-y-3">
          {query.data.items.length === 0 && (
            <p className="text-sm text-gray-500">조건에 맞는 쿠폰이 없습니다.</p>
          )}
          {query.data.items.map((coupon) => (
            <div key={coupon.couponId} className="space-y-1 rounded border border-gray-200 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{coupon.name}</span>
                <span className={coupon.isActive ? 'text-emerald-700' : 'text-gray-400'}>
                  {coupon.isActive ? '활성' : '비활성'}
                </span>
              </div>
              <p className="text-gray-600">
                {coupon.scope} ·{' '}
                {coupon.discountType === 'RATE'
                  ? `${coupon.discountValue}%`
                  : `${coupon.discountValue}원`}{' '}
                · 최소주문 {coupon.minOrderAmount}원
              </p>
              <p className="text-gray-600">
                발급 {coupon.issuedQuantity}
                {coupon.totalQuantity === null ? ' (무제한)' : ` / ${coupon.totalQuantity}`}
              </p>
              <p className="text-gray-600">
                발급기간 {coupon.issueStartAt ?? '제한없음'} ~ {coupon.issueEndAt ?? '제한없음'}
              </p>
              <div className="flex gap-3">
                <Link
                  className="text-blue-600 underline"
                  to={`/admin/coupon-events?couponId=${coupon.couponId}`}
                >
                  이벤트 제어로 이동
                </Link>
                <Link
                  className="text-blue-600 underline"
                  to={`/admin/coupons/${coupon.couponId}/issues`}
                >
                  발급 목록 보기
                </Link>
              </div>
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
            {query.data.nextPageToken && (
              <button
                type="button"
                className="rounded border border-gray-300 px-3 py-1 text-sm"
                onClick={() => setPageToken(query.data.nextPageToken ?? undefined)}
              >
                더보기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
