# fm-frontend

신선식품 자사몰 프론트엔드. React 19, TypeScript, Vite, Tailwind CSS.
백엔드는 별도 레포 [fm-backend](https://github.com/fresh-market/fm-backend)이고,
이 레포의 API 클라이언트는 그 백엔드를 그대로 호출한다.

```bash
git clone https://github.com/fresh-market/fm-frontend.git frontend
cd frontend
npm install
npm run dev            # 5173 포트
```

백엔드를 같이 띄워야 화면이 실제로 동작한다.

```bash
# 별도 터미널, fm-backend 레포에서
./gradlew bootRun       # compose.yaml 의 MySQL/Valkey 를 자동으로 띄운다, 8080 포트
```

fm-backend `application.yml`의 CORS `allowed-origins` 기본값이 `http://localhost:5173`으로
고정되어 있다. 

## 기술 스택

| | |
|---|---|
| Vite + React + TypeScript | 빌드/화면 |
| Tailwind CSS | 스타일링. 브랜드 컬러는 `src/index.css`의 `@theme`에 정의 |
| TanStack Query (React Query) | 서버 상태. 재시도 정책은 API별로 다르게 건다 |
| react-router-dom | 라우팅 |
| fetch 기반 API 클라이언트 (`src/api/client.ts`) | axios 없이 직접 구현. 모든 요청에 `credentials: 'include'`, 10초 타임아웃 |

## 인증

- **관리자**: 아이디/비밀번호 로그인(`/admin/login`). 액세스/리프레시 토큰 모두 HttpOnly 쿠키로
  내려온다 — 프론트는 토큰을 직접 다루지 않는다.
- **회원**: 카카오 로그인만 지원한다(별도 회원가입 없음, 첫 로그인 시 자동 가입). 로그인 버튼을
  누르면 백엔드가 만들어 준 카카오 인가 URL로 리다이렉트하고, `/oauth/callback`에서 인가 코드를
  받아 로그인을 완료한다. 
- 로그인 상태 표시: 회원은 `GET /v1/members/me`로 실시간 확인하고, 관리자는 그런 API가 없어서
  로그인/로그아웃 액션 시점에 `localStorage`에 상태를 남겨 헤더가 참고한다.


## 화면 구성

| 경로 | 화면 | 인증 |
|---|---|---|
| `/` | 쇼핑몰 홈 | - |
| `/login` | 회원 로그인 (카카오) | - |
| `/oauth/callback` | 카카오 로그인 콜백 처리 | - |
| `/coupons/issue` | 쿠폰 받기, 발급 현황 표시 | 회원 |
| `/admin/login` | 관리자 로그인 | - |
| `/admin/coupons` | 쿠폰 목록 (필터, 커서 페이지네이션) | 관리자 |
| `/admin/coupon-events` | 쿠폰 이벤트 제어 (열기/닫기/발급기간 변경/정합성 검증) | 관리자 |
| `/admin/coupons/:couponId/issues` | 발급 목록/상태 이력 | 관리자 |

couponId는 관리자 쿠폰 CRUD 화면이 없어서 텍스트 입력 또는 URL 쿼리파라미터(`?couponId=`)로 받는다.

## 프로젝트 구조

```
src/
  api/          API 클라이언트(client.ts), 도메인별 요청 함수(auth.ts, coupon.ts)
  components/   공통 레이아웃(StorefrontLayout, AdminLayout), Badge, Logo
  hooks/        useDebouncedValue 등
  pages/        라우트별 화면 컴포넌트
  router.tsx    라우트 정의
```

## 참고할 점

| 이벤트 상태 | 쿠폰 발급 집계값 | 실제 발급 건수 | 화면 표시 |
|---|---|---|---|
| 진행 중 | 갱신 안 됨 (보통 0) | 항상 정확 | "차이 있습니다" ← 정상 |
| 마감 후 | 실제 값으로 동기화됨 | 항상 정확 | "일치합니다" |

"쿠폰 발급 집계값"(`coupon.issued_quantity`)은 이벤트를 마감할 때만 실제 값으로 동기화되는
구조라 진행 중인 이벤트에서는 항상 "차이 있음"으로 뜬다. "실제 발급 건수"는 `member_coupon`을 직접 세는 값이라 이벤트 상태와 무관하게
항상 정확하다.

발급 현황(issuance-status) 조회는 서버 에러(401/403/503 등)에 재시도하지 않는다. 선착순
이벤트로 트래픽이 몰릴 때 재시도가 부하를 증폭시키는 걸 막기 위해서다. 다른 API는 React Query
기본 재시도 정책(최대 3회)을 그대로 쓴다.
