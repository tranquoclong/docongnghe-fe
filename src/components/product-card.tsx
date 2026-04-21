'use client'

import { Link } from '@/i18n/routing'
import { formatCurrency, generateSlugUrl, cn } from '@/lib/utils'
import { ProductListResType } from '@/schemaValidations/product.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import Image from 'next/image'
import { Heart, Star } from 'lucide-react'
import { useState } from 'react'

export interface ArticleCardProps {
  product: ProductListResType['data'][0]
  brands?: BrandListResType['data']
  rating?: number
  promotionTags?: string[]
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ product, rating, promotionTags = [] }) => {
  const [wished, setWished] = useState(false)

  const hasDiscount = product.virtualPrice != null && product.virtualPrice > product.basePrice

  const discountPercent = hasDiscount
    ? Math.round(((product.virtualPrice! - product.basePrice) / product.virtualPrice!) * 100)
    : 0

  const slug = generateSlugUrl({ name: product.name, id: product.id })

  return (
    <div className='group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5'>
      <Link href={`/products/${slug}`} className='relative block'>
        {hasDiscount && (
          <span className='absolute left-0 top-3 z-10 rounded-r-md bg-red-500 px-2.5 py-1 text-xs font-bold text-white tracking-wide'>
            Giảm {discountPercent}%
          </span>
        )}
        <span className='absolute right-2.5 top-3 z-10 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'>
          Trả góp 0%
        </span>
        <div className='relative h-44 rounded-md m-3 overflow-hidden bg-white'>
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
              className='object-contain p-3 transition-transform duration-300 group-hover:scale-105'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <ImagePlaceholder />
            </div>
          )}
        </div>
      </Link>
      <Link href={`/products/${slug}`} className='flex flex-1 flex-col gap-2 px-3 pb-3 pt-2.5'>
        <h3 className='line-clamp-2 text-sm font-semibold leading-snug text-card-foreground'>{product.name}</h3>
        <div className='flex flex-wrap items-baseline gap-2'>
          <span className='text-base font-bold text-red-600 dark:text-red-400'>
            {formatCurrency(product.basePrice)}
          </span>
          {hasDiscount && (
            <span className='text-xs text-muted-foreground line-through'>{formatCurrency(product.virtualPrice!)}</span>
          )}
        </div>
        {promotionTags.length > 0 && (
          <div className='flex flex-col gap-1'>
            {promotionTags.map((tag, i) => (
              <span
                key={i}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px]',
                  i % 2 === 0
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
      <div className='flex items-center justify-between border-t border-border/60 px-3 py-2.5'>
        {rating != null ? (
          <div className='flex items-center gap-1'>
            <Star className='h-4 w-4 fill-amber-400 stroke-amber-400' />
            <span className='text-sm font-semibold text-amber-500'>{rating}</span>
          </div>
        ) : (
          <div />
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            setWished((v) => !v)
          }}
          className='flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-red-500'
          aria-label={wished ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart
            className={cn('h-4 w-4 transition-colors', wished ? 'fill-red-500 stroke-red-500 text-red-500' : '')}
          />
          <span>Yêu thích</span>
        </button>
      </div>
    </div>
  )
}

function ImagePlaceholder() {
  return (
    <svg width='48' height='48' viewBox='0 0 48 48' fill='none' className='text-muted-foreground/30'>
      <rect width='48' height='48' rx='8' fill='currentColor' fillOpacity='0.1' />
      <path d='M8 34l12-16 8 10 6-8 10 14H8z' fill='currentColor' fillOpacity='0.25' />
      <circle cx='34' cy='16' r='5' fill='currentColor' fillOpacity='0.25' />
    </svg>
  )
}
