import { useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import StorefrontLayout from '../components/StorefrontLayout'
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES, type Product } from '../data/mockProducts'

const PAGE_SIZE = 12
const SORT_OPTIONS = {
  default: '기본순',
  priceAsc: '낮은 가격순',
  priceDesc: '높은 가격순',
} as const
type SortKey = keyof typeof SORT_OPTIONS

const STOCK_BADGE_TONE: Record<Product['stockLabel'], 'green' | 'amber' | 'rose'> = {
  '재고 충분': 'green',
  '재고 임박': 'amber',
  품절: 'rose',
}

function formatPrice(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

function ProductCard({ product }: { product: Product }) {
  const [optionIndex, setOptionIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)
  const selectedOption = product.options[optionIndex]
  const isSoldOut = product.stockLabel === '품절'

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm shadow-gray-900/5 transition-shadow hover:shadow-md">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-5xl">
        {imageFailed ? (
          <span aria-hidden>{product.thumbnail}</span>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400">{product.origin}</p>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
        </div>
        <Badge tone={STOCK_BADGE_TONE[product.stockLabel]}>{product.stockLabel}</Badge>
      </div>

      {product.options.length > 1 ? (
        <select
          className="mt-3 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          value={optionIndex}
          onChange={(event) => setOptionIndex(Number(event.target.value))}
          disabled={isSoldOut}
        >
          {product.options.map((option, index) => (
            <option key={option.label} value={index}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-3 text-sm text-gray-500">{selectedOption.label}</p>
      )}

      <p className="mt-auto pt-3 text-right text-lg font-bold text-brand-800">
        {formatPrice(product.basePrice + selectedOption.priceOffset)}
      </p>
    </div>
  )
}

export default function ProductListPage() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [page, setPage] = useState(1)

  const filteredProducts = useMemo(() => {
    const filtered = categoryFilter
      ? MOCK_PRODUCTS.filter((product) => product.category === categoryFilter)
      : MOCK_PRODUCTS

    if (sortKey === 'default') return filtered
    const sorted = [...filtered]
    sorted.sort((a, b) => (sortKey === 'priceAsc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice))
    return sorted
  }, [categoryFilter, sortKey])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function selectCategory(category: string | null) {
    setCategoryFilter(category)
    setPage(1)
  }

  return (
    <StorefrontLayout>
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">상품 조회</h1>
          <p className="mt-1 text-sm text-gray-500">
            신선한 상품을 카테고리별로 둘러보고 옵션을 골라보세요.
          </p>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                categoryFilter === null
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => selectCategory(null)}
            >
              전체
            </button>
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  categoryFilter === category
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => selectCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <label className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-gray-500">정렬</span>
            <select
              className="rounded-lg border border-gray-300 px-2 py-1.5 focus:border-brand-500 focus:outline-none"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              {Object.entries(SORT_OPTIONS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mb-3 text-sm text-gray-500">총 {filteredProducts.length}개 상품</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-1.5">
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                  pageNumber === currentPage
                    ? 'bg-brand-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </nav>
        )}
      </section>
    </StorefrontLayout>
  )
}
