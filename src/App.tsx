import { Link } from 'react-router-dom'
import StorefrontLayout from './components/StorefrontLayout'

function App() {
  return (
    <StorefrontLayout>
      <section className="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
        <span className="rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
          오늘 아침에 수확한 신선함, Fresh Market
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
          가장 신선한 재료를
          <br className="hidden sm:block" /> 가장 좋은 가격에
        </h1>
        <p className="max-w-xl text-gray-500">
          산지 직송 신선식품 자사몰입니다. 선착순 쿠폰 이벤트로 더 알뜰하게 장보세요.
        </p>
        <Link
          to="/coupons/issue"
          className="rounded-full bg-brand-600 px-8 py-3 font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700"
        >
          선착순 쿠폰 받으러 가기
        </Link>
      </section>

      <section className="border-t border-brand-100 bg-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-14 sm:grid-cols-3">
          {[
            { emoji: '🥬', title: '산지 직송', desc: '수확 당일 출고로 신선함을 그대로' },
            { emoji: '⏱️', title: '선착순 발급', desc: '한정 수량 쿠폰, 먼저 받는 분이 임자' },
            { emoji: '🧾', title: '투명한 재고', desc: '발급 현황을 실시간으로 확인' },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{item.emoji}</span>
              <h3 className="font-semibold text-brand-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </StorefrontLayout>
  )
}

export default App
