'use client'

import { ProductListResType } from '@/schemaValidations/product.schema'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import { ArticleCard } from '@/components/product-card'
import { generateSlugUrl, cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

type ProductItem = ProductListResType['data'][0]
type CategoryItem = CategoryListResType['data'][0]

interface ProductFilterProps {
  products: ProductItem[]
  categories: CategoryListResType['data']
  brands: BrandListResType['data']
  parentCategory: CategoryItem
  bannerImage?: string
  bannerLink?: string
  promotionTags?: string[]
}

export default function ProductFilter({
  products,
  categories,
  brands,
  parentCategory,
  bannerImage,
  bannerLink,
  promotionTags = ['Member giảm đến 274.000đ', 'Student giảm thêm 500.000đ']
}: ProductFilterProps) {
  const children = parentCategory.childrenCategories ?? []

  const categoryIds = new Set([String(parentCategory.id), ...children.map((c) => String(c.id))])
  const displayProducts = products.filter((p) => p.categories?.some((c) => categoryIds.has(String(c.id)))).slice(0, 4)

  const parentSlug = generateSlugUrl({ name: parentCategory.name, id: parentCategory.id })
  const hasBanner = Boolean(bannerImage)

  return (
    <section className='rounded-xl border bg-card overflow-hidden'>
      <div className='flex min-h-[360px] sm:min-h-[420px]'>
        {hasBanner && (
          <div className='hidden sm:block w-[160px] md:w-[200px] lg:w-[240px] flex-shrink-0 border-r relative'>
            <Link href={bannerLink ?? `/products?category=${parentSlug}`} className='block w-full h-full'>
              <Image
                src={bannerImage!}
                alt={parentCategory.name}
                fill
                className='object-cover hover:scale-[1.02] rounded-xl transition-transform duration-300'
                sizes='(max-width: 768px) 160px, (max-width: 1024px) 200px, 240px'
              />
              <div className='absolute inset-x-0 rounded-xl bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent' />
              <span className='absolute bottom-3 left-0 right-0 text-center text-white text-xs font-semibold px-2 drop-shadow-sm'>
                {parentCategory.name}
              </span>
            </Link>
          </div>
        )}

        <div className='flex-1 min-w-0 flex flex-col'>
          <div className='flex items-center justify-between px-4 sm:px-5 py-3 border-b bg-muted/20 flex-shrink-0'>
            <Link
              href={`/products?category=${parentSlug}`}
              className='text-sm sm:text-base font-bold text-primary uppercase tracking-wide hover:opacity-80 transition-opacity'
            >
              {parentCategory.name}
            </Link>
            <Link
              href={`/products?category=${parentSlug}`}
              className='flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors'
            >
              Xem tất cả <ChevronRight className='h-3.5 w-3.5' />
            </Link>
          </div>

          {children.length > 0 && (
            <div className='px-4 sm:px-5 py-2.5 border-b bg-muted/10 overflow-x-auto scrollbar-hide flex-shrink-0'>
              <div className='flex gap-2 w-max'>
                {children.map((child) => {
                  const childSlug = generateSlugUrl({ name: child.name, id: child.id })
                  return (
                    <Link
                      key={child.id}
                      href={`/products?category=${childSlug}`}
                      className='flex items-center gap-2 flex-shrink-0 border rounded-lg px-2.5 py-1.5 bg-background hover:border-primary/40 hover:bg-primary/5 transition-all group'
                    >
                      {child.logo && (
                        <div className='relative h-10 w-10 flex-shrink-0'>
                          <Image src={child.logo} alt={child.name} fill className='object-contain' sizes='28px' />
                        </div>
                      )}
                      <span className='text-xs text-muted-foreground font-medium group-hover:text-foreground whitespace-nowrap transition-colors leading-tight max-w-[150px] line-clamp-2'>
                        {child.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
          <div className='flex-1 p-3 sm:p-4'>
            {displayProducts.length === 0 ? (
              <div className='flex items-center justify-center h-full min-h-[200px] text-sm text-muted-foreground'>
                Chưa có sản phẩm
              </div>
            ) : (
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 h-full'>
                {displayProducts.map((product) => (
                  <ArticleCard key={product.id} product={product} rating={4.5} promotionTags={promotionTags} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
