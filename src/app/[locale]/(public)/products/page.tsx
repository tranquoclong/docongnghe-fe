import productApiRequest from '@/apiRequests/product'
import envConfig, { Locale } from '@/config'
import { wrapServerApi } from '@/lib/utils'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ProductFilter from './product-filter'
import categoryApiRequest from '@/apiRequests/category'
import brandApiRequest from '@/apiRequests/brand'
import { ProductListResType } from '@/schemaValidations/product.schema'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'

export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string; locale: Locale }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'ProductPage'
  })
  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/products`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url
    }
  }
}

export default async function ProductPage(props: {
  params: Promise<{
    locale: Locale
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams

  const [productResult, categoryResult, brandResult] = await Promise.allSettled([
    wrapServerApi(productApiRequest.list),
    wrapServerApi(categoryApiRequest.list),
    wrapServerApi(brandApiRequest.list)
  ])
  const data = {
    productRes: productResult.status === 'fulfilled' ? productResult.value : null,
    categoryRes: categoryResult.status === 'fulfilled' ? categoryResult.value : null,
    brandRes: brandResult.status === 'fulfilled' ? brandResult.value : null
  }
  const productList: ProductListResType['data'] = data.productRes?.payload?.data || []
  const categoryList: CategoryListResType['data'] = data.categoryRes?.payload?.data || []
  const brandList: BrandListResType['data'] = data.brandRes?.payload?.data || []

  return (
    <ProductFilter products={productList} categories={categoryList} brands={brandList} searchParams={searchParams} />
  )
}
