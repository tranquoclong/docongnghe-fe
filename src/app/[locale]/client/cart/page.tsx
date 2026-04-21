import CartDetail from '@/app/[locale]/client/cart/cart-detail'
import envConfig, { Locale } from '@/config'
import { baseOpenGraph } from '@/shared-metadata'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Cart'
  })

  const url = envConfig.NEXT_PUBLIC_URL + `/${params.locale}/client/cart`

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      ...baseOpenGraph,
      title: t('title'),
      description: t('description'),
      url
    },
    alternates: {
      canonical: url
    },
    robots: {
      index: false
    }
  }
}

export default function CartPage() {
  return (
    <div className='mx-20'>
      <h1 className='text-center text-xl font-bold mb-8'>Giỏ hàng</h1>
      <CartDetail />
    </div>
  )
}
