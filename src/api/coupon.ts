import { apiClient } from './client'

export interface IssuePeriodUpdateRequest {
  issueStartAt: string
  issueEndAt: string
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
