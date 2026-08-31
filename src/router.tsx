import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import AdminCouponEventPage from './pages/AdminCouponEventPage'
import CouponIssuePage from './pages/CouponIssuePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/admin/coupon-events',
    element: <AdminCouponEventPage />,
  },
  {
    path: '/coupons/issue',
    element: <CouponIssuePage />,
  },
])
