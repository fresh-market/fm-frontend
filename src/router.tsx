import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import AdminCouponEventPage from './pages/AdminCouponEventPage'
import AdminCouponIssuesPage from './pages/AdminCouponIssuesPage'
import AdminCouponListPage from './pages/AdminCouponListPage'
import AdminLoginPage from './pages/AdminLoginPage'
import CouponIssuePage from './pages/CouponIssuePage'
import KakaoCallbackPage from './pages/KakaoCallbackPage'
import MemberLoginPage from './pages/MemberLoginPage'
import ProductListPage from './pages/ProductListPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/coupons',
    element: <AdminCouponListPage />,
  },
  {
    path: '/admin/coupons/:couponId/issues',
    element: <AdminCouponIssuesPage />,
  },
  {
    path: '/admin/coupon-events',
    element: <AdminCouponEventPage />,
  },
  {
    path: '/login',
    element: <MemberLoginPage />,
  },
  {
    path: '/oauth/callback',
    element: <KakaoCallbackPage />,
  },
  {
    path: '/coupons/issue',
    element: <CouponIssuePage />,
  },
  {
    path: '/products',
    element: <ProductListPage />,
  },
])
