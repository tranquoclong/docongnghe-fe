import { wrapServerApi } from '@/lib/utils'
import categoryApiRequest from '@/apiRequests/category'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import NavMenu from '@/components/ui/mega-menu'
import type { NavItem } from '@/components/ui/mega-menu'

export default async function NavItems({ className }: { className?: string }) {
  const categoryResult = await wrapServerApi(categoryApiRequest.list)
  const categoryList: CategoryListResType['data'] = categoryResult?.payload.data ?? []
  const NAV_ITEMS: NavItem[] = [
    {
      label: 'Products',
      subMenus: [
        {
          title: 'Danh mục',
          items: categoryList
        }
      ],
      hideWhenLogin: true
    },
    { label: 'Cart', link: '/client/cart' },
    { label: 'Order', link: '/client/orders' }
  ]

  return (
    <>
      <NavMenu variant='horizontal' items={NAV_ITEMS} />
      {/* {menuItems.map((item) => {
        const isAuth = item.role && role && item.role.includes(role)
        const canShow = (item.role === undefined && !item.hideWhenLogin) || (!role && item.hideWhenLogin)
        if (isAuth || canShow) {
          return (
            <Link href={item.href} key={item.href} className={className}>
              {t(item.title as any)}
            </Link>
          )
        }
        return null
      })} */}
    </>
  )
}
