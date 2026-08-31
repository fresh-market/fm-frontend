import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ApiError } from './api/client'
import './index.css'
import { router } from './router'

// ApiError(401/403/503 COUPON-012 등)는 서버가 이미 판단을 내려준 응답이라 재시도해도 결과가
// 바뀌지 않는다. 선착순 이벤트처럼 트래픽이 몰려 서버가 503을 던지는 상황에서 기본 재시도(3회)를
// 그대로 두면 클라이언트마다 요청이 3배로 증폭돼 부하를 더 키운다. 진짜 네트워크 단절
// (NetworkError)만 재시도 대상으로 남긴다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !(error instanceof ApiError) && failureCount < 3,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
