'use client'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import NavMenu from '@/components/ui/mega-menu'
import { CategoryListResType } from '@/schemaValidations/category.schema'

const ITEMS = [
  {
    id: 1,
    label: 'MacBook Neo',
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/slidingmobanmacneo.png'
  },
  {
    id: 2,
    label: 'Samsung Galaxy S25',
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/home-x9ultra-roi1.png'
  },
  {
    id: 3,
    label: 'OPPO Find N6',
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/oppofingn6.png'
  },
  {
    id: 4,
    label: 'iPhone 17e',
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/690x300_open_iPhone%2017e.png'
  },
  {
    id: 5,
    label: 'Xiaomi Redmi A7 Pro',
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/dien-thoai-xiaomi-redmi-a7-pro-home.png'
  }
]

export default function Hero({ categoryList }: { categoryList: CategoryListResType['data'] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev === ITEMS.length - 1 ? 0 : prev + 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className='flex gap-4 pb-6 px-4 md:px-8 justify-center'>
      <NavMenu variant='sidebar' items={[{ label: 'Danh mục', items: categoryList }]} />
      <div className='flex flex-col gap-2 flex-1 min-w-0 max-w-4xl'>
        <div className='relative w-full overflow-hidden rounded-2xl'>
          <Carousel index={index} onIndexChange={setIndex} disableDrag={false}>
            <CarouselContent>
              {ITEMS.map((item) => (
                <CarouselItem key={item.id}>
                  <div className='relative w-full aspect-[16/7]'>
                    <Image
                      src={item.image}
                      fill
                      quality={85}
                      priority={true}
                      alt={item.label}
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, 800px'
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10'>
            {ITEMS.map((_, i) => (
              <button
                key={i}
                type='button'
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === i ? 'bg-white w-5' : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
        <div className='flex gap-2'>
          {ITEMS.map((item, i) => (
            <button
              key={item.id}
              type='button'
              aria-label={`Xem ${item.label}`}
              onClick={() => setIndex(i)}
              className={`relative flex-1 aspect-[16/7] rounded-lg overflow-hidden transition-all duration-200 ${
                index === i ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-60 hover:opacity-90'
              }`}
            >
              <Image
                src={item.image}
                fill
                quality={60}
                priority={false}
                alt={item.label}
                className='object-cover'
                sizes='160px'
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
