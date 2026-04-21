import productApiRequest from '@/apiRequests/product'
import ProductDetail from '@/app/[locale]/(public)/products/[slug]/product-detail'
import envConfig, { Locale } from '@/config'
import { htmlToTextForDescription } from '@/lib/server-utils'
import { generateSlugUrl, getIdFromSlugUrl, wrapServerApi } from '@/lib/utils'
import { baseOpenGraph } from '@/shared-metadata'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { cache } from 'react'

export const revalidate = 3600

const getDetail = cache((id: number) => wrapServerApi(() => productApiRequest.getProduct(id)))

export async function generateStaticParams() {
  const result = await wrapServerApi(productApiRequest.list)
  if (!result) return []
  return result.payload.data.map((product) => ({
    category: generateSlugUrl({ name: product.name, id: product.id }),
    slug: generateSlugUrl({ name: product.name, id: product.id })
  }))
}

type Props = {
  params: Promise<{ slug: string; locale: Locale }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'ProductDetail'
  })
  const id = getIdFromSlugUrl(params.slug)
  const data = await getDetail(id)
  const product = data?.payload
  if (!product) {
    return {
      title: t('notFound'),
      description: t('notFound')
    }
  }
  const url =
    envConfig.NEXT_PUBLIC_URL +
    `/${params.locale}/products/${generateSlugUrl({
      name: product.name,
      id: product.id
    })}`

  return {
    title: product.name,
    description: htmlToTextForDescription(product.productTranslations[0].description),
    openGraph: {
      ...baseOpenGraph,
      title: product.name,
      description: product.productTranslations[0].description,
      url,
      images: [
        {
          url: product.images[0]
        }
      ]
    },
    alternates: {
      canonical: url
    }
  }
}

export default async function ProductDetailPage(props: {
  params: Promise<{
    slug: string
    locale: Locale
  }>
}) {
  const params = await props.params

  const { slug, locale } = params
  const id = getIdFromSlugUrl(slug)
  const data = await getDetail(id)
  const product = data?.payload
  return <ProductDetail product={product} locale={locale} />
}
