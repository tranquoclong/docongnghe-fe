'use client'

import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import { BrandListResType } from '@/schemaValidations/brand.schema'
export default function Teaser({ brandList }: { brandList: BrandListResType['data'] }) {
  return (
    <div>
      <InfiniteMovingCards
        items={brandList.map((brand) => ({ image: brand.logo }))}
        direction='right'
        speed='slow'
        logo={true}
      />
      <InfiniteMovingCards items={testimonials} direction='left' speed='slow' />
    </div>
  )
}

const testimonials = [
  {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/aicopisd.png'
  },
  {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/ggggedfcwef.jpg'
  },
  {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/s-edu-2025.jpg'
  },
  {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/s-edu-2-0-slide-ipad-1.png'
  },
  {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/frdgrfvdrvfdxfv.png'
  },
  {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/ocb-h.jpg'
  },
  {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/uu-dai-hsbc-01-2025-slide-28-05.jpg'
  },
  {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/sgsgssgdffff.png'
  }
]
