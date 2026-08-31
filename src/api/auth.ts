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

const ADMIN_SESSION_KEY = 'adminSession'

export interface AdminSession {
  loginId: string
  name: string
  role: AdminRole
}

// 회원과 달리 관리자에게는 "내 정보 확인" API(GET /v1/members/me 같은 것)가 없어서, 헤더가
// 실시간으로 로그인 여부를 물어볼 방법이 없다. 대신 로그인/로그아웃 액션이 일어난 시점에
// 로컬에 상태를 남겨 헤더가 그걸 참고한다. 서버 세션이 30분 뒤 조용히 만료되는 것까지는
// 못 따라가지만, 우리 로그인/로그아웃 버튼을 거친 흐름은 정확히 반영한다.
export function markAdminSession(session: AdminSession) {
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
  } catch {
    // 저장에 실패해도 로그인 자체는 이미 끝난 뒤라 무시한다
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY)
  } catch {
    // no-op
  }
}

export function readAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY)
    return raw ? (JSON.parse(raw) as AdminSession) : null
  } catch {
    return null
  }
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
