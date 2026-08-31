import { apiClient } from './client'

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN'

export interface AdminLoginResponse {
  expiresInSeconds: number
  admin: { loginId: string; name: string; role: AdminRole }
}

export function adminLogin(loginId: string, password: string) {
  return apiClient.post<AdminLoginResponse>('/v1/admin/auth/tokens', { loginId, password })
}

export function adminLogout() {
  return apiClient.delete<void>('/v1/admin/auth/tokens')
}

export interface KakaoAuthorizeResponse {
  authorizationUrl: string
}

export function fetchKakaoAuthorizeUrl(reauth = false) {
  return apiClient.get<KakaoAuthorizeResponse>(`/v1/auth/kakao/authorize?reauth=${reauth}`)
}

export interface MemberSummary {
  memberId: number
  nickname: string
  status: string
}

export interface MemberTokenResponse {
  expiresInSeconds: number
  member: MemberSummary | null
}

export function memberLogin(authorizationCode: string, state: string, remember: boolean) {
  return apiClient.post<MemberTokenResponse>('/v1/auth/tokens', {
    authorizationCode,
    state,
    remember,
  })
}

export function memberLogout() {
  return apiClient.delete<void>('/v1/auth/tokens')
}

export interface MemberProfile {
  memberId: number
  nickname: string
}

// 로그인 여부를 판단하는 용도로도 쓴다 — 401/403이면 로그아웃 상태로 본다.
export function fetchMyProfile(signal?: AbortSignal) {
  return apiClient.get<MemberProfile>('/v1/members/me', { signal })
}
