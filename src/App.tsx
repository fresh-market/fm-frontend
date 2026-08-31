import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-gray-500">fm-frontend</p>
      <Link className="text-blue-600 underline" to="/admin/coupons">
        쿠폰 목록 (관리자)
      </Link>
      <Link className="text-blue-600 underline" to="/admin/coupon-events">
        쿠폰 이벤트 제어 (관리자)
      </Link>
      <Link className="text-blue-600 underline" to="/coupons/issue">
        쿠폰 받기
      </Link>
    </div>
  )
}

export default App
