import { Role } from '@/constants/type'
import { Home, ShoppingCart, Users2, Component, Table, Users, ChartBarStacked, Shuffle, Ticket } from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    roles: [Role.ADMIN, Role.SELLER]
  },
  {
    title: 'Đơn hàng',
    Icon: ShoppingCart,
    href: '/manage/orders',
    roles: [Role.ADMIN, Role.SELLER]
  },
  {
    title: 'Sản phẩm',
    Icon: Component,
    href: '/manage/products',
    roles: [Role.ADMIN, Role.SELLER]
  },
  {
    title: 'Thương hiệu',
    Icon: Shuffle,
    href: '/manage/brands',
    roles: [Role.ADMIN, Role.SELLER]
  },
  {
    title: 'Danh mục',
    Icon: ChartBarStacked,
    href: '/manage/categories',
    roles: [Role.ADMIN, Role.SELLER]
  },
  {
    title: 'Voucher',
    Icon: Ticket,
    href: '/manage/vouchers',
    roles: [Role.ADMIN, Role.SELLER]
  },
  // {
  //   title: 'Món ăn',
  //   Icon: Salad,
  //   href: '/manage/dishes',
  //   roles: [Role.ADMIN, Role.SELLER]
  // },
  {
    title: 'Khách hàng',
    Icon: Users,
    href: '/manage/guests',
    roles: [Role.ADMIN, Role.SELLER]
  },
  {
    title: 'Nhân viên',
    Icon: Users2,
    href: '/manage/accounts',
    roles: [Role.ADMIN]
  }
]

export default menuItems
