// 상품 API가 아직 없어 시연용으로 프론트에서만 들고 있는 목데이터.
// 백엔드에 상품 조회 API가 생기면 이 파일을 걷어내고 react-query 훅으로 교체한다.
// 대표 이미지는 scripts/download-product-images.mjs 로 public/products/{id}.jpg 에 미리 받아둔 것을 쓴다.

export interface ProductOption {
  label: string
  priceOffset: number
}

export interface Product {
  id: number
  category: string
  name: string
  origin: string
  thumbnail: string
  imageUrl: string
  basePrice: number
  stockLabel: '재고 충분' | '재고 임박' | '품절'
  // 상품-쿠폰 연결 API가 없어 목데이터에서 임시로 붙인 값. 재고 임박 상품 10개(couponId
  // 900002/900003/900010/900011/900018/900019/900026/900027/900034/900035)만 로컬 개발 DB에
  // 직접 심어뒀고(데모용, Flyway 아님), 나머지는 존재하지 않는 쿠폰이라 이벤트 열기를 호출하면
  // COUPON-001로 실패한다.
  couponId: string
  options: ProductOption[]
}

const CATEGORY_SEEDS: Array<{
  category: string
  thumbnail: string
  items: Array<{
    name: string
    origin: string
    basePrice: number
    keyword: string
    options: ProductOption[]
  }>
}> = [
  {
    category: '채소',
    thumbnail: '🥬',
    items: [
      { name: '유기농 상추', origin: '국내산 · 경기', basePrice: 3500, keyword: 'lettuce', options: [{ label: '1봉(200g)', priceOffset: 0 }, { label: '3봉(600g)', priceOffset: 6500 }] },
      { name: '깐마늘', origin: '국내산 · 의성', basePrice: 6900, keyword: 'garlic', options: [{ label: '500g', priceOffset: 0 }, { label: '1kg', priceOffset: 5900 }] },
      { name: '방울토마토', origin: '국내산 · 부여', basePrice: 8900, keyword: 'cherrytomato', options: [{ label: '500g', priceOffset: 0 }, { label: '1kg', priceOffset: 7900 }] },
      { name: '무농약 청양고추', origin: '국내산 · 진주', basePrice: 4200, keyword: 'chilipepper', options: [{ label: '200g', priceOffset: 0 }, { label: '500g', priceOffset: 4800 }] },
      { name: '알감자', origin: '국내산 · 강원', basePrice: 5900, keyword: 'potato', options: [{ label: '1kg', priceOffset: 0 }, { label: '3kg', priceOffset: 11800 }] },
      { name: '양파', origin: '국내산 · 무안', basePrice: 4900, keyword: 'onion', options: [{ label: '1.5kg', priceOffset: 0 }, { label: '3kg', priceOffset: 4500 }] },
      { name: '애호박', origin: '국내산 · 논산', basePrice: 2200, keyword: 'zucchini', options: [{ label: '1개', priceOffset: 0 }, { label: '3개', priceOffset: 4800 }] },
      { name: '건표고버섯', origin: '국내산 · 장수', basePrice: 12900, keyword: 'shiitakemushroom', options: [{ label: '150g', priceOffset: 0 }, { label: '300g', priceOffset: 11900 }] },
    ],
  },
  {
    category: '과일',
    thumbnail: '🍎',
    items: [
      { name: '부사 사과', origin: '국내산 · 청송', basePrice: 12900, keyword: 'apple', options: [{ label: '5입', priceOffset: 0 }, { label: '10입', priceOffset: 11900 }] },
      { name: '샤인머스캣', origin: '국내산 · 상주', basePrice: 18900, keyword: 'greengrapes', options: [{ label: '1송이', priceOffset: 0 }, { label: '2송이', priceOffset: 17900 }] },
      { name: '제주 감귤', origin: '국내산 · 제주', basePrice: 15900, keyword: 'tangerine', options: [{ label: '3kg', priceOffset: 0 }, { label: '5kg', priceOffset: 9900 }] },
      { name: '바나나', origin: '필리핀산', basePrice: 4900, keyword: 'banana', options: [{ label: '1송이(약 1.2kg)', priceOffset: 0 }] },
      { name: '멜론', origin: '국내산 · 나주', basePrice: 13900, keyword: 'melon', options: [{ label: '1통', priceOffset: 0 }] },
      { name: '델라웨어 포도', origin: '국내산 · 김천', basePrice: 9900, keyword: 'grapes', options: [{ label: '1kg', priceOffset: 0 }] },
      { name: '천혜향', origin: '국내산 · 제주', basePrice: 16900, keyword: 'citrus', options: [{ label: '2kg', priceOffset: 0 }, { label: '4kg', priceOffset: 15900 }] },
      { name: '토마토', origin: '국내산 · 부여', basePrice: 7900, keyword: 'tomato', options: [{ label: '1.5kg', priceOffset: 0 }] },
    ],
  },
  {
    category: '육류',
    thumbnail: '🥩',
    items: [
      { name: '한우 등심', origin: '국내산 · 1++', basePrice: 32900, keyword: 'beefsteak', options: [{ label: '200g', priceOffset: 0 }, { label: '400g', priceOffset: 31900 }] },
      { name: '삼겹살', origin: '국내산 · 제주', basePrice: 15900, keyword: 'porkbelly', options: [{ label: '500g', priceOffset: 0 }, { label: '1kg', priceOffset: 14900 }] },
      { name: '닭가슴살', origin: '국내산', basePrice: 8900, keyword: 'chickenbreast', options: [{ label: '1kg', priceOffset: 0 }, { label: '2kg', priceOffset: 7900 }] },
      { name: '항정살', origin: '국내산', basePrice: 13900, keyword: 'porkmeat', options: [{ label: '300g', priceOffset: 0 }] },
      { name: '소불고기', origin: '국내산 · 한우', basePrice: 21900, keyword: 'beef', options: [{ label: '500g', priceOffset: 0 }] },
      { name: '닭볶음탕용', origin: '국내산', basePrice: 9900, keyword: 'rawchicken', options: [{ label: '1kg', priceOffset: 0 }] },
      { name: '수제 다짐육', origin: '국내산', basePrice: 10900, keyword: 'groundbeef', options: [{ label: '500g', priceOffset: 0 }] },
      { name: '오리훈제', origin: '국내산', basePrice: 14900, keyword: 'smokedduck', options: [{ label: '500g', priceOffset: 0 }] },
    ],
  },
  {
    category: '수산물',
    thumbnail: '🐟',
    items: [
      { name: '노르웨이 생연어', origin: '노르웨이산', basePrice: 16900, keyword: 'salmon', options: [{ label: '300g', priceOffset: 0 }, { label: '500g', priceOffset: 12900 }] },
      { name: '손질 갈치', origin: '국내산 · 제주', basePrice: 19900, keyword: 'hairtailfish', options: [{ label: '2토막', priceOffset: 0 }] },
      { name: '국내산 새우', origin: '국내산 · 서해', basePrice: 22900, keyword: 'shrimp', options: [{ label: '500g', priceOffset: 0 }] },
      { name: '자숙 문어', origin: '국내산', basePrice: 24900, keyword: 'octopus', options: [{ label: '500g', priceOffset: 0 }] },
      { name: '고등어', origin: '국내산 · 통영', basePrice: 8900, keyword: 'mackerel', options: [{ label: '2마리', priceOffset: 0 }] },
      { name: '건멸치', origin: '국내산 · 남해', basePrice: 12900, keyword: 'driedanchovy', options: [{ label: '300g', priceOffset: 0 }] },
      { name: '전복', origin: '국내산 · 완도', basePrice: 29900, keyword: 'abalone', options: [{ label: '5미', priceOffset: 0 }] },
      { name: '오징어', origin: '국내산 · 동해', basePrice: 9900, keyword: 'squid', options: [{ label: '2마리', priceOffset: 0 }] },
    ],
  },
  {
    category: '유제품',
    thumbnail: '🥛',
    items: [
      { name: '서울우유', origin: '국내산', basePrice: 2900, keyword: 'milk', options: [{ label: '900ml', priceOffset: 0 }, { label: '1.8L', priceOffset: 2600 }] },
      { name: '그릭요거트', origin: '국내산', basePrice: 6900, keyword: 'greekyogurt', options: [{ label: '400g', priceOffset: 0 }] },
      { name: '슬라이스 치즈', origin: '국내산', basePrice: 5900, keyword: 'slicedcheese', options: [{ label: '20매', priceOffset: 0 }] },
      { name: '무염버터', origin: '뉴질랜드산', basePrice: 8900, keyword: 'butter', options: [{ label: '450g', priceOffset: 0 }] },
      { name: '생크림', origin: '국내산', basePrice: 4900, keyword: 'whippingcream', options: [{ label: '500ml', priceOffset: 0 }] },
      { name: '떠먹는 요거트', origin: '국내산', basePrice: 5400, keyword: 'yoghurt', options: [{ label: '4개입', priceOffset: 0 }] },
      { name: '생모짜렐라 치즈', origin: '국내산', basePrice: 7900, keyword: 'mozzarella', options: [{ label: '200g', priceOffset: 0 }] },
      { name: '저지방 우유', origin: '국내산', basePrice: 3200, keyword: 'milkbottle', options: [{ label: '900ml', priceOffset: 0 }] },
    ],
  },
]

function buildStockLabel(index: number): Product['stockLabel'] {
  const remainder = index % 9
  if (remainder === 0) return '품절'
  if (remainder <= 2) return '재고 임박'
  return '재고 충분'
}

export const MOCK_PRODUCTS: Product[] = CATEGORY_SEEDS.flatMap((seed) =>
  seed.items.map((item, index) => ({
    id: seed.category.charCodeAt(0) * 1000 + index,
    category: seed.category,
    name: item.name,
    origin: item.origin,
    thumbnail: seed.thumbnail,
    imageUrl: '',
    basePrice: item.basePrice,
    stockLabel: buildStockLabel(index),
    couponId: '',
    options: item.options,
  })),
).map((product, index) => ({
  ...product,
  id: index + 1,
  imageUrl: `/products/${index + 1}.jpg`,
  couponId: String(900001 + index),
}))

export const PRODUCT_CATEGORIES = CATEGORY_SEEDS.map((seed) => seed.category)
