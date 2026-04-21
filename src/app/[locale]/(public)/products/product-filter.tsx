'use client'

import { ProductListResType } from '@/schemaValidations/product.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from '@/i18n/routing'
import { ArticleCard } from '@/components/product-card'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import NavMenu from '@/components/ui/mega-menu'
import { generateSlugUrl, cn } from '@/lib/utils'
import Image from 'next/image'

interface ProductFilterProps {
  products: ProductListResType['data']
  categories: CategoryListResType['data']
  brands: BrandListResType['data']
  searchParams: { [key: string]: string | string[] | undefined }
}

const PAGE_SIZE = 12

function getParam(param: string | string[] | undefined) {
  if (Array.isArray(param)) return param[0]
  return param ?? ''
}

function parseIdFromSlug(slug: string): string {
  if (!slug) return 'all'
  const parts = slug.split('-')
  for (let i = parts.length - 1; i >= 0; i--) {
    const num = parseInt(parts[i], 10)
    if (!isNaN(num) && String(num) === parts[i]) return String(num)
  }
  return 'all'
}

export default function ProductFilter({ products, categories, brands, searchParams }: ProductFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const urlSearch = getParam(searchParams.q)
  const urlSort = getParam(searchParams.sort) || 'default'
  const urlCategorySlug = getParam(searchParams.category)
  const urlBrandSlug = getParam(searchParams.brand)
  const urlCategoryId = urlCategorySlug ? parseIdFromSlug(urlCategorySlug) : 'all'
  const urlBrandId = urlBrandSlug ? parseIdFromSlug(urlBrandSlug) : 'all'

  const [search, setSearch] = useState(urlSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [showFilters, setShowFilters] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const isMounted = useRef(false)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [urlCategoryId, urlBrandId, urlSort, debouncedSearch])

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timerRef.current)
  }, [search])
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    updateUrl({ q: debouncedSearch || null })
  }, [debouncedSearch])

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(searchParams)) {
        if (value !== undefined) {
          params.set(key, Array.isArray(value) ? value[0] : value)
        }
      }
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key)
        else params.set(key, value)
      }
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  const handleSort = (value: string) => updateUrl({ sort: value === 'default' ? null : value })

  const handleCategory = (catId: string, catName: string) => {
    if (catId === 'all') {
      updateUrl({ category: null, brand: null })
    } else {
      updateUrl({ category: generateSlugUrl({ name: catName, id: Number(catId) }), brand: null })
    }
  }

  const handleBrand = (brandId: string, brandName: string) => {
    if (urlBrandId === brandId) {
      updateUrl({ brand: null })
    } else {
      updateUrl({ brand: generateSlugUrl({ name: brandName, id: Number(brandId) }) })
    }
  }

  const clearFilter = () => {
    setSearch('')
    setDebouncedSearch('')
    router.replace(pathname, { scroll: false })
  }

  const matchingCategoryIds = useMemo(() => {
    if (urlCategoryId === 'all') return null
    const ids = new Set<string>()
    ids.add(urlCategoryId)
    for (const parent of categories) {
      const children = parent.childrenCategories || []
      const parentIdStr = String(parent.id)
      const childrenIdStrs = children.map((c) => String(c.id))
      if (parentIdStr === urlCategoryId) childrenIdStrs.forEach((cid) => ids.add(cid))
      if (childrenIdStrs.includes(urlCategoryId)) ids.add(parentIdStr)
    }
    return ids
  }, [urlCategoryId, categories])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (matchingCategoryIds) {
      result = result.filter((p) => p.categories?.some((c: { id: number }) => matchingCategoryIds.has(String(c.id))))
    }

    if (urlBrandId !== 'all') {
      result = result.filter((p) => String(p.brandId) === urlBrandId)
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter((p) => {
        const mainName = p.name?.toLowerCase() ?? ''
        const inTranslations = p.productTranslations?.some(
          (t) => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
        )
        return mainName.includes(q) || inTranslations
      })
    }

    if (urlSort === 'price-asc') result = [...result].sort((a, b) => a.basePrice - b.basePrice)
    else if (urlSort === 'price-desc') result = [...result].sort((a, b) => b.basePrice - a.basePrice)
    else if (urlSort === 'name-asc') result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    else if (urlSort === 'popular')
      result = [...result].sort((a, b) => (b._count?.orders ?? 0) - (a._count?.orders ?? 0))

    return result
  }, [products, matchingCategoryIds, urlBrandId, debouncedSearch, urlSort])

  const availableBrands = useMemo(() => {
    const base = matchingCategoryIds
      ? products.filter((p) => p.categories?.some((c: { id: number }) => matchingCategoryIds.has(String(c.id))))
      : products
    const ids = new Set(base.map((p) => String(p.brandId)))
    return brands.filter((b) => ids.has(String(b.id)))
  }, [products, brands, matchingCategoryIds])

  const pagedProducts = filteredProducts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProducts.length
  const remaining = filteredProducts.length - visibleCount

  const activeFilterCount = [
    urlCategoryId !== 'all',
    urlBrandId !== 'all',
    urlSort !== 'default',
    debouncedSearch !== ''
  ].filter(Boolean).length

  const hasFilter = activeFilterCount > 0

  const sortLabel: Record<string, string> = {
    popular: 'Phổ biến nhất',
    'price-asc': 'Giá tăng dần',
    'price-desc': 'Giá giảm dần',
    'name-asc': 'Tên A–Z'
  }

  const selectedCategory = categories
    .flatMap((c) => [c, ...(c.childrenCategories || [])])
    .find((c) => String(c.id) === urlCategoryId)

  const selectedBrand = brands.find((b) => String(b.id) === urlBrandId)

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
          <Input
            placeholder='Tìm sản phẩm...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9 pr-9 h-10'
          />
          {search && (
            <button
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              onClick={() => {
                setSearch('')
                setDebouncedSearch('')
              }}
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        <div className='flex gap-2'>
          <Select value={urlSort} onValueChange={handleSort}>
            <SelectTrigger className='w-[160px] h-10'>
              <SelectValue placeholder='Sắp xếp' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='default'>Mặc định</SelectItem>
              <SelectItem value='popular'>Phổ biến nhất</SelectItem>
              <SelectItem value='price-asc'>Giá tăng dần</SelectItem>
              <SelectItem value='price-desc'>Giá giảm dần</SelectItem>
              <SelectItem value='name-asc'>Tên A–Z</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            size='icon'
            className='h-10 w-10 sm:hidden relative'
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className='h-4 w-4' />
            {activeFilterCount > 0 && (
              <span className='absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium leading-none'>
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasFilter && (
            <Button
              variant='ghost'
              size='icon'
              className='h-10 w-10 hidden sm:flex'
              onClick={clearFilter}
              title='Xóa tất cả bộ lọc'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
      {hasFilter && (
        <div className='flex flex-wrap items-center gap-2'>
          {debouncedSearch && (
            <Badge variant='secondary' className='gap-1 pr-1 h-6 text-xs font-normal'>
              Tìm: "{debouncedSearch}"
              <button
                onClick={() => {
                  setSearch('')
                  setDebouncedSearch('')
                }}
                className='ml-0.5 hover:text-destructive'
              >
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant='secondary' className='gap-1 pr-1 h-6 text-xs font-normal'>
              {selectedCategory.name}
              <button onClick={() => handleCategory('all', '')} className='ml-0.5 hover:text-destructive'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}
          {selectedBrand && (
            <Badge variant='secondary' className='gap-1 pr-1 h-6 text-xs font-normal'>
              {selectedBrand.name}
              <button onClick={() => updateUrl({ brand: null })} className='ml-0.5 hover:text-destructive'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}
          {urlSort !== 'default' && (
            <Badge variant='secondary' className='gap-1 pr-1 h-6 text-xs font-normal'>
              {sortLabel[urlSort]}
              <button onClick={() => handleSort('default')} className='ml-0.5 hover:text-destructive'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}
          <button
            onClick={clearFilter}
            className='text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors'
          >
            Xóa tất cả
          </button>
        </div>
      )}
      <div className='flex gap-6 items-start'>
        <aside className={cn('w-52 flex-shrink-0 space-y-6 hidden sm:block', showFilters && '!block w-full sm:w-52')}>
          {categories.length > 0 && (
            <section>
              <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5'>Danh mục</h3>
              <NavMenu variant='sidebar' items={[{ label: 'Danh mục', items: categories }]} />
            </section>
          )}

          {availableBrands.length > 0 && (
            <section>
              <div className='flex items-center justify-between mb-2.5'>
                <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Thương hiệu</h3>
                {urlBrandId !== 'all' && (
                  <button
                    onClick={() => updateUrl({ brand: null })}
                    className='text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors'
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              <div className='grid grid-cols-2 gap-2'>
                {availableBrands.map((brand) => {
                  const isActive = urlBrandId === String(brand.id)
                  return (
                    <button
                      key={brand.id}
                      onClick={() => handleBrand(String(brand.id), brand.name)}
                      className={cn(
                        'group flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-center transition-all duration-150',
                        isActive
                          ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/30 hover:bg-accent/50'
                      )}
                    >
                      <div className='relative h-7 w-full'>
                        {brand.logo ? (
                          <Image src={brand.logo} alt={brand.name} fill className='object-contain' sizes='76px' />
                        ) : (
                          <div className='h-7 w-full flex items-center justify-center rounded bg-muted'>
                            <span className='text-[10px] font-semibold text-muted-foreground'>
                              {brand.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[11px] leading-tight line-clamp-1 w-full transition-colors',
                          isActive ? 'text-primary font-medium' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      >
                        {brand.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          <div className='sm:hidden pt-2'>
            <Button variant='outline' size='sm' className='w-full' onClick={() => setShowFilters(false)}>
              Áp dụng bộ lọc
            </Button>
          </div>
        </aside>
        <div className='flex-1 min-w-0 space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {filteredProducts.length > 0
                ? `${filteredProducts.length} sản phẩm${selectedCategory ? ` trong "${selectedCategory.name}"` : ''}${selectedBrand ? ` · ${selectedBrand.name}` : ''}`
                : 'Không có sản phẩm'}
            </p>
            {filteredProducts.length > 0 && (
              <p className='text-xs text-muted-foreground hidden sm:block'>
                Hiển thị {pagedProducts.length}/{filteredProducts.length}
              </p>
            )}
          </div>

          {pagedProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
              <div className='h-14 w-14 rounded-full bg-muted flex items-center justify-center'>
                <Search className='h-5 w-5 text-muted-foreground' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Không tìm thấy sản phẩm</p>
                <p className='text-xs text-muted-foreground'>Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc</p>
              </div>
              {hasFilter && (
                <Button variant='outline' size='sm' onClick={clearFilter}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {pagedProducts.map((product) => (
                <ArticleCard
                  key={product.id}
                  product={product}
                  rating={4.5}
                  promotionTags={['Member giảm đến 274.000đ', 'Student giảm thêm 500.000đ']}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className='flex flex-col items-center gap-1.5 pt-2'>
              <Button
                variant='outline'
                className='gap-2 min-w-[180px] h-9'
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              >
                <ChevronDown className='h-4 w-4' />
                Xem thêm{' '}
                <span className='text-muted-foreground font-normal text-xs'>
                  ({Math.min(remaining, PAGE_SIZE)} / còn {remaining})
                </span>
              </Button>
              <div className='w-full max-w-xs bg-muted rounded-full h-1 overflow-hidden'>
                <div
                  className='h-full bg-primary/40 rounded-full transition-all duration-300'
                  style={{ width: `${(pagedProducts.length / filteredProducts.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {!hasMore && filteredProducts.length > PAGE_SIZE && (
            <p className='text-center text-xs text-muted-foreground pt-2'>
              Đã hiển thị tất cả {filteredProducts.length} sản phẩm
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
