// 시연용 상품 목데이터(src/data/mockProducts.ts)의 대표 이미지를 받아 public/products/{id}.jpg 에 저장한다.
// 실행: node scripts/download-product-images.mjs
// 상품 API가 생기기 전까지만 쓰는 일회성 스크립트라 mockProducts.ts 의 키워드 순서를 그대로 복제해서 쓴다
// (mockProducts.ts 의 카테고리·상품 순서를 바꾸면 이 목록도 같이 바꿔야 한다).

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'products')

const KEYWORDS = [
  'lettuce', 'garlic', 'cherrytomato', 'chilipepper', 'potato', 'onion', 'zucchini', 'shiitakemushroom',
  'apple', 'greengrapes', 'tangerine', 'banana', 'melon', 'grapes', 'citrus', 'tomato',
  'beefsteak', 'porkbelly', 'chickenbreast', 'porkmeat', 'beef', 'rawchicken', 'groundbeef', 'smokedduck',
  'salmon', 'hairtailfish', 'shrimp', 'octopus', 'mackerel', 'driedanchovy', 'abalone', 'squid',
  'milk', 'greekyogurt', 'slicedcheese', 'butter', 'whippingcream', 'yoghurt', 'mozzarella', 'milkbottle',
]

async function downloadOne(id, keyword) {
  const url = `https://loremflickr.com/480/480/${keyword},food`
  const destination = path.join(OUTPUT_DIR, `${id}.jpg`)

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'follow' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.byteLength < 1000) throw new Error('응답이 너무 작음 (placeholder 실패 페이지로 추정)')
      await writeFile(destination, buffer)
      console.log(`[OK] ${id}.jpg <- ${keyword} (${buffer.byteLength} bytes)`)
      return
    } catch (error) {
      console.warn(`[RETRY ${attempt}/3] ${id}.jpg (${keyword}): ${error.message}`)
    }
  }
  console.error(`[FAIL] ${id}.jpg (${keyword}) — 3번 실패, 수동 확인 필요`)
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  for (let index = 0; index < KEYWORDS.length; index += 1) {
    await downloadOne(index + 1, KEYWORDS[index])
  }
}

main()
