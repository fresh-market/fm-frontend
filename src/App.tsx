import { Link } from 'react-router-dom'
import StorefrontLayout from './components/StorefrontLayout'

function App() {
  return (
    <StorefrontLayout>
      <section className="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
        <span className="rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
          지금, 선착순 쿠폰 이벤트 진행 중
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
          <span className="block">신선식품을</span>
          <span className="mt-2 block">가장 합리적인 가격에</span>
        </h1>
        <p className="max-w-xl text-gray-500">
          신선식품 자사몰 Fresh Market입니다.
          <br />
          한정 수량 쿠폰, 서두르지 않으면 금방 마감돼요.
        </p>
        <Link
          to="/coupons/issue"
          className="rounded-full bg-brand-600 px-8 py-3 font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700"
        >
          선착순 쿠폰 받으러 가기
        </Link>
      </section>

      <section className="border-t border-brand-100 bg-white">
        <div className="mx-auto grid max-w-2xl gap-6 px-6 py-14 sm:grid-cols-2">
          {[
            { emoji: '⏱️', title: '선착순 발급', desc: '한정 수량 쿠폰, 먼저 받는 분이 임자' },
            { emoji: '📊', title: '남은 수량 확인', desc: '몇 장 남았는지 보고 타이밍을 놓치지 마세요' },
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
