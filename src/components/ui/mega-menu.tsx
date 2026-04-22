'use client'

import * as React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from '@/i18n/routing'
import { generateSlugUrl } from '@/lib/utils'
import { useAppStore } from '../app-provider'
import DynamicIcon from '../layout/dynamic-icon'
import { BorderBeam } from './shine-border'

export type NavItem = {
  label: string
  link?: string
  hideWhenLogin?: boolean
  items?: CategoryListResType['data']
  subMenus?: {
    title: string
    items: CategoryListResType['data']
  }[]
}

export type NavMenuVariant = 'horizontal' | 'sidebar'

export interface NavMenuProps {
  items: NavItem[]
  variant?: NavMenuVariant
  className?: string
}

const ICON_SIZE = {
  md: { wrap: 'size-[34px] rounded-lg', svg: 'h-[18px] w-[18px]' },
  sm: { wrap: 'size-7 rounded-md', svg: 'h-4 w-4' }
} as const

type ItemRowProps = {
  item: CategoryListResType['data'][0]
  size?: 'md' | 'sm'
  isSidebar?: boolean
  image?: boolean
  activeItem?: string | null
  setActiveItem?: (label: string | null) => void
}

const ItemRow = ({ item, size = 'md', isSidebar = false, image = false, activeItem, setActiveItem }: ItemRowProps) => {
  const hasChildren = !!item.childrenCategories?.length
  const iconCls = ICON_SIZE[size]

  return (
    <li
      className='relative'
      onMouseEnter={() => {
        if (hasChildren) setActiveItem?.(item.name)
      }}
      onMouseLeave={(e) => {
        const related = e.relatedTarget
        if (related instanceof Node && e.currentTarget.contains(related)) return
        setActiveItem?.(null)
      }}
    >
      <Link
        href={`/products?category=${generateSlugUrl({ name: item.name, id: item.id })}`}
        className={[
          'group flex items-center gap-2.5 rounded-xl transition-colors duration-150 hover:bg-accent hover:text-accent-foreground',
          size === 'md' ? 'px-2.5 py-2' : 'px-2 py-1.5'
        ].join(' ')}
      >
        {image ? (
          <Avatar className='h-10 w-10'>
            <AvatarImage src={item?.logo ?? undefined} alt={item?.name} />
            <AvatarFallback>{item?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <div
            className={[
              'flex shrink-0 items-center justify-center border transition-colors duration-150 hover:bg-accent hover:text-accent-foreground',
              iconCls.wrap
            ].join(' ')}
          >
            <DynamicIcon name={item.logo} />
          </div>
        )}
        <div className={isSidebar ? 'flex-1' : ''}>
          <p className='text-sm font-medium leading-none'>{item.name}</p>
          {/* {item.description && <p className='mt-1 text-[11px] leading-none text-white/40'>{item.description}</p>} */}
        </div>
        {hasChildren && (
          <ChevronRight className='ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5' />
        )}
      </Link>

      <AnimatePresence>
        {activeItem === item.name && hasChildren && (
          <motion.div
            className='absolute left-full top-0 z-20 pl-2'
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className='w-58 rounded-2xl border bg-popover text-popover-foreground p-3'>
              <ul className='flex flex-col gap-1'>
                {item.childrenCategories!.map((child) => (
                  <ItemRow key={child.name} item={child} size='sm' image={true} />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

const NavMenu = React.forwardRef<HTMLElement, NavMenuProps>(({ items, variant = 'horizontal', className }, ref) => {
  const isSidebar = variant === 'sidebar'
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [activeItem, setActiveItem] = React.useState<string | null>(null)
  const role = useAppStore((state) => state.role)
  if (isSidebar) {
    return (
      <nav ref={ref as React.Ref<HTMLElement>} className={className}>
        <ul className='flex w-60 flex-col gap-1 p-2 rounded-2xl border relative w-full max-w-[350px]'>
          {items[0]?.items?.map((item) => (
            <ItemRow
              key={item.name}
              item={item}
              size='md'
              isSidebar
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />
          ))}
          <BorderBeam duration={6} size={400} className='from-transparent via-[#3a86ff] to-transparent' />
          <BorderBeam
            duration={6}
            delay={3}
            size={400}
            borderWidth={2}
            className='from-transparent via-[#ff006e] to-transparent'
          />
        </ul>
      </nav>
    )
  }

  return (
    <nav ref={ref as React.Ref<HTMLElement>} className={className}>
      <ul className='relative flex items-center'>
        {items.map((navItem) => {
          const canShow = role || navItem.hideWhenLogin
          if (canShow) {
            return (
              <li
                key={navItem.label}
                className='relative'
                onMouseEnter={() => {
                  setOpenMenu(navItem.label)
                  setActiveItem(null)
                }}
                onMouseLeave={() => {
                  setOpenMenu(null)
                  setActiveItem(null)
                }}
              >
                <Link
                  href={navItem.link ?? '#'}
                  className='group relative flex cursor-pointer items-center gap-1 rounded-md px-4 py-1.5 text-sm transition-colors duration-150 '
                >
                  <span className='relative z-10'>{navItem.label}</span>
                  {navItem.subMenus && (
                    <ChevronDown
                      className={[
                        'relative z-10 h-4 w-4 transition-transform duration-200',
                        openMenu === navItem.label ? 'rotate-180' : ''
                      ].join(' ')}
                    />
                  )}
                  {openMenu === navItem.label && (
                    <span className='absolute inset-0 rounded-md bg-accent text-accent-foreground' />
                  )}
                </Link>

                {navItem.subMenus && (
                  <div
                    className='absolute left-0 top-full z-10 pt-2 transition-all duration-150'
                    style={{
                      visibility: openMenu === navItem.label ? 'visible' : 'hidden',
                      opacity: openMenu === navItem.label ? 1 : 0,
                      pointerEvents: openMenu === navItem.label ? 'auto' : 'none',
                      transform: openMenu === navItem.label ? 'translateY(0)' : 'translateY(-6px)'
                    }}
                  >
                    <div className='rounded-2xl border bg-popover text-popover-foreground p-4'>
                      <div className='flex w-max gap-9'>
                        {navItem.subMenus.map((sub) => (
                          <div key={sub.title} className='w-58'>
                            <h3 className='mb-3 text-[11px] font-medium uppercase tracking-wider'>{sub.title}</h3>
                            <ul className='flex flex-col gap-1'>
                              {sub.items.map((item) => (
                                <ItemRow
                                  key={item.name}
                                  item={item}
                                  size='md'
                                  isSidebar={false}
                                  activeItem={activeItem}
                                  setActiveItem={setActiveItem}
                                />
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            )
          }
          return null
        })}
      </ul>
    </nav>
  )
})

NavMenu.displayName = 'NavMenu'

export default NavMenu
