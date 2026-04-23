import productApiRequest from '@/apiRequests/product'
import { wrapServerApi } from '@/lib/utils'
import { ProductListResType } from '@/schemaValidations/product.schema'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import envConfig, { Locale } from '@/config'
import { htmlToTextForDescription } from '@/lib/server-utils'
import ProductFilter from '@/app/[locale]/(public)/product-filter'
import Teaser from '@/app/[locale]/(public)/about-teaser'
import About from '@/app/[locale]/(public)/about'
import ScrollAnimate from '@/components/scroll-animate'
import categoryApiRequest from '@/apiRequests/category'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import Hero from './hero'
import brandApiRequest from '@/apiRequests/brand'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import { AuroraText } from '@/components/ui/aurora-text'

export const revalidate = 3600

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({ locale, namespace: 'HomePage' })
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}`

  return {
    title: t('title'),
    description: htmlToTextForDescription(t('description')),
    alternates: {
      canonical: url
    }
  }
}

const BANNER_MAP: Record<number, { image: string; link: string }> = {
  48: {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:321:960/q:100/plain/https://media-asset.cellphones.com.vn/page_configs/01KG6K3S7WG02MXRFGD9N1WQQE.png',
    link: '#'
  },
  40: {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:321:960/q:100/plain/https://media-asset.cellphones.com.vn/page_configs/01KM2Q70GFVDKYHVN3SR9SWAGK.jpg',
    link: '#'
  },
  34: {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:321:960/q:100/plain/https://media-asset.cellphones.com.vn/page_configs/01K9XZX2K0Q0BX8QSVAGM40QYM.png',
    link: '#'
  },
  29: {
    image: '',
    link: '#'
  },
  11: {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:321:795/q:100/plain/https://media-asset.cellphones.com.vn/page_configs/01KK84Q078JE7HEGK1SF3GGZGZ.png',
    link: '#'
  },
  5: {
    image:
      'https://cdn2.cellphones.com.vn/insecure/rs:fill:321:795/q:100/plain/https://media-asset.cellphones.com.vn/page_configs/01KK8E4NQYFFSS1BRHNV4WXZZP.png',
    link: '#'
  },
  4: {
    image: '',
    link: '#'
  },
  1: {
    image: '',
    link: '#'
  }
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params

  const { locale } = params

  setRequestLocale(locale)
  const t = await getTranslations('HomePage')

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
    <div className='w-full space-y-0'>
      <Hero categoryList={categoryList} />
      <ScrollAnimate delay={150}>
        <Teaser brandList={brandList} />
      </ScrollAnimate>
      <ScrollAnimate>
        <section id='product-listing' className='space-y-10 py-16 px-4 md:px-8'>
          <h2 className='text-center text-2xl font-bold'>
            {t('h2')}
            <AuroraText className='ml-1'>{t('h2_2')}</AuroraText>
          </h2>
          {categoryList
            .filter((cat) => [48, 40, 34, 11, 5].includes(cat.id))
            .reverse()
            .map((parentCategory) => (
              <ProductFilter
                key={parentCategory.id}
                products={productList}
                categories={categoryList}
                brands={brandList}
                parentCategory={parentCategory}
                bannerImage={BANNER_MAP[parentCategory.id]?.image}
                bannerLink={BANNER_MAP[parentCategory.id]?.link}
              />
            ))}
        </section>
      </ScrollAnimate>
      <ScrollAnimate delay={150}>
        <About />
      </ScrollAnimate>
    </div>
  )
}
