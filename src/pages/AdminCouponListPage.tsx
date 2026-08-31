import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, NetworkError } from '../api/client'
import { fetchAdminCoupons } from '../api/coupon'
import AdminLayout from '../components/AdminLayout'
import { Badge } from '../components/Badge'

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
    queryFn: ({ signal }) =>
      fetchAdminCoupons({ isActive: isActiveFilter, scope: scopeFilter, pageToken }, signal),
  })

  function resetToFirstPage() {
    setPageToken(undefined)
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">쿠폰 목록</h1>
        <p className="mt-1 text-sm text-gray-500">발급 중인 쿠폰과 재고를 한눈에 확인합니다.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">활성 여부</span>
          <select
            className="rounded-lg border border-gray-300 px-2 py-1.5 focus:border-brand-500 focus:outline-none"
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
          <span className="text-gray-500">적용 범위</span>
          <select
            className="rounded-lg border border-gray-300 px-2 py-1.5 focus:border-brand-500 focus:outline-none"
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
            <p className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-400">
              조건에 맞는 쿠폰이 없습니다.
            </p>
          )}
          {query.data.items.map((coupon) => (
            <div
              key={coupon.couponId}
              className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm shadow-gray-900/5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{coupon.name}</span>
                <Badge tone={coupon.isActive ? 'green' : 'gray'}>
                  {coupon.isActive ? '활성' : '비활성'}
                </Badge>
              </div>
              <p className="mt-2 text-gray-500">
                {coupon.scope} ·{' '}
                {coupon.discountType === 'RATE'
                  ? `${coupon.discountValue}%`
                  : `${coupon.discountValue}원`}{' '}
                · 최소주문 {coupon.minOrderAmount}원
              </p>
              <p className="text-gray-500">
                발급 {coupon.issuedQuantity}
                {coupon.totalQuantity === null ? ' (무제한)' : ` / ${coupon.totalQuantity}`}
              </p>
              <p className="text-gray-500">
                발급기간 {coupon.issueStartAt ?? '제한없음'} ~ {coupon.issueEndAt ?? '제한없음'}
              </p>
              <div className="mt-3 flex gap-4 border-t border-gray-100 pt-3">
                <Link
                  className="text-sm font-medium text-brand-700 hover:text-brand-800"
                  to={`/admin/coupon-events?couponId=${coupon.couponId}`}
                >
                  이벤트 제어로 이동 →
                </Link>
                <Link
                  className="text-sm font-medium text-brand-700 hover:text-brand-800"
                  to={`/admin/coupons/${coupon.couponId}/issues`}
                >
                  발급 목록 보기 →
                </Link>
              </div>
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
            {query.data.nextPageToken && (
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                onClick={() => setPageToken(query.data.nextPageToken ?? undefined)}
              >
                더보기
              </button>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
