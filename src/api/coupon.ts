import { apiClient } from './client'

export interface IssuePeriodUpdateRequest {
  issueStartAt: string
  issueEndAt: string
}

export interface CouponIssueResponse {
  issueSeq: number
  alreadyIssued: boolean
}

export function issueCoupon(couponId: string) {
  return apiClient.post<CouponIssueResponse>(`/v1/coupons/${couponId}/issues`)
}

export function openCouponEvent(couponId: string) {
  return apiClient.post<void>(`/v1/admin/coupons/${couponId}/event:open`)
}

export function closeCouponEvent(couponId: string) {
  return apiClient.post<void>(`/v1/admin/coupons/${couponId}/event:close`)
}

export function changeIssuePeriod(couponId: string, request: IssuePeriodUpdateRequest) {
  return apiClient.patch<void>(`/v1/admin/coupons/${couponId}/issue-period`, request)
}

export interface ConsistencyCheckResponse {
  issuedQuantityOnCoupon: number
  actualIssueCount: number
  duplicatedMembers: number
  seqGaps: number[]
  consistent: boolean
}

export function verifyCouponConsistency(couponId: string) {
  return apiClient.post<ConsistencyCheckResponse>(`/v1/admin/coupons/${couponId}:verifyConsistency`)
}

export interface IssuanceStatusResponse {
  totalQuantity: number
  issuedQuantity: number
  remaining: number
}

export function fetchIssuanceStatus(couponId: string) {
  return apiClient.get<IssuanceStatusResponse>(`/v1/coupons/${couponId}/issuance-status`)
}

// fm-backend CursorPageResponse<T> 그대로. nextPageToken이 없으면 마지막 페이지
export interface CursorPageResponse<T> {
  items: T[]
  nextPageToken: string | null
}

export interface AdminCouponListItem {
  couponId: number
  name: string
  scope: 'ORDER' | 'ITEM'
  discountType: 'AMOUNT' | 'RATE'
  discountValue: number
  maxDiscountAmount: number | null
  minOrderAmount: number
  totalQuantity: number | null
  issuedQuantity: number
  issueStartAt: string | null
  issueEndAt: string | null
  validFrom: string
  validTo: string
  targetGradeId: number | null
  isActive: boolean
}

export interface AdminCouponListParams {
  isActive?: boolean
  scope?: string
  pageToken?: string
  pageSize?: number
}

export function fetchAdminCoupons(params: AdminCouponListParams = {}) {
  const search = new URLSearchParams()
  if (params.isActive !== undefined) search.set('isActive', String(params.isActive))
  if (params.scope) search.set('scope', params.scope)
  if (params.pageToken) search.set('pageToken', params.pageToken)
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const query = search.toString()
  return apiClient.get<CursorPageResponse<AdminCouponListItem>>(
    `/v1/admin/coupons${query ? `?${query}` : ''}`,
  )
}

export type MemberCouponStatus = 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELED'

export interface AdminMemberCouponListItem {
  memberCouponId: number
  memberId: number
  issueSeq: number | null
  status: MemberCouponStatus
  issuedAt: string
  usedAt: string | null
}

export interface AdminCouponIssuesParams {
  status?: MemberCouponStatus
  pageToken?: string
  pageSize?: number
}

export function fetchCouponIssues(couponId: string, params: AdminCouponIssuesParams = {}) {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.pageToken) search.set('pageToken', params.pageToken)
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const query = search.toString()
  return apiClient.get<CursorPageResponse<AdminMemberCouponListItem>>(
    `/v1/admin/coupons/${couponId}/issues${query ? `?${query}` : ''}`,
  )
}

export interface AdminMemberCouponHistoryEntry {
  fromStatus: string | null
  toStatus: string
  reason: string | null
  changedBy: number | null
  createdAt: string
}

export interface AdminMemberCouponHistoryResponse {
  history: AdminMemberCouponHistoryEntry[]
}

export function fetchMemberCouponHistory(memberCouponId: number) {
  return apiClient.get<AdminMemberCouponHistoryResponse>(
    `/v1/admin/member-coupons/${memberCouponId}/history`,
  )
}
