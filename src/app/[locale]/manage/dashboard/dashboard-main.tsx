'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import { formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { endOfDay, format, startOfDay, subDays, startOfMonth } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

type DatePreset = 'today' | '7d' | '30d' | 'month' | null
import { useDashboardIndicator } from '@/queries/useIndicator'
import { TopDishesTable } from './top-dishes-table'
import { exportDashboardCSV } from '@/lib/export-csv'
import { useAppStore } from '@/components/app-provider'

// Dynamic imports cho chart components
const RevenueLineChart = dynamic(
  () => import('./revenue-line-chart').then((mod) => ({ default: mod.RevenueLineChart })),
  {
    loading: () => (
      <div className='h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center'>
        <span className='text-gray-500'>Đang tải biểu đồ...</span>
      </div>
    ),
    ssr: false
  }
)

const DishBarChart = dynamic(() => import('./dish-bar-chart').then((mod) => ({ default: mod.DishBarChart })), {
  loading: () => (
    <div className='h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center'>
      <span className='text-gray-500'>Đang tải biểu đồ...</span>
    </div>
  ),
  ssr: false
})

const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())

export default function DashboardMain() {
  const [fromDate, setFromDate] = useState(initFromDate)
  const [toDate, setToDate] = useState(initToDate)
  const [activePreset, setActivePreset] = useState<DatePreset>(null)
  const { data, refetch } = useDashboardIndicator({
    fromDate,
    toDate
  })
  const socket = useAppStore((state) => state.socket)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!socket) return
    const debouncedRefetch = () => {
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => refetch(), 500)
    }
    socket.on('new-order', debouncedRefetch)
    socket.on('update-order', debouncedRefetch)
    socket.on('payment', debouncedRefetch)
    return () => {
      socket.off('new-order', debouncedRefetch)
      socket.off('update-order', debouncedRefetch)
      socket.off('payment', debouncedRefetch)
      clearTimeout(debounceRef.current)
    }
  }, [socket, refetch])
  const datas = {
    status: 200,
    payload: {
      data: {
        revenue: 845000000,
        clientCount: 1284,
        orderCount: 1876,
        servingOrderCount: 47,
        productIndicator: [
          {
            id: 1,
            publishedAt: '2026-01-10T08:00:00.000Z',
            name: 'iPhone 15 Pro Max 256GB',
            basePrice: 28000000,
            virtualPrice: 32000000,
            brandId: 1,
            images: [
              'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-plus_1__1.png'
            ],
            variants: [
              {
                value: 'Màu sắc',
                options: ['Titan Đen', 'Titan Trắng', 'Titan Tự Nhiên', 'Titan Xanh']
              },
              {
                value: 'Dung lượng',
                options: ['256GB', '512GB', '1TB']
              }
            ],
            createdById: 1,
            updatedById: 2,
            deletedById: null,
            deletedAt: null,
            createdAt: '2026-01-05T07:00:00.000Z',
            updatedAt: '2026-04-01T09:00:00.000Z',
            successOrders: 412
          },
          {
            id: 2,
            publishedAt: '2026-02-01T08:00:00.000Z',
            name: 'Samsung Galaxy S24 Ultra',
            basePrice: 26000000,
            virtualPrice: 30000000,
            brandId: 2,
            images: [
              'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-222_1_1_1_1.png'
            ],
            variants: [
              {
                value: 'Màu sắc',
                options: ['Titan Đen', 'Titan Xám', 'Tím']
              },
              {
                value: 'Dung lượng',
                options: ['256GB', '512GB']
              }
            ],
            createdById: 1,
            updatedById: 1,
            deletedById: null,
            deletedAt: null,
            createdAt: '2026-01-20T07:00:00.000Z',
            updatedAt: '2026-03-15T10:00:00.000Z',
            successOrders: 378
          },
          {
            id: 3,
            publishedAt: '2026-03-01T08:00:00.000Z',
            name: 'MacBook Air M3 15 inch',
            basePrice: 32000000,
            virtualPrice: 37000000,
            brandId: 1,
            images: [
              'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook_13_17.png'
            ],
            variants: [
              {
                value: 'Màu sắc',
                options: ['Midnight', 'Silver', 'Starlight', 'Space Gray']
              },
              {
                value: 'Cấu hình',
                options: ['8GB RAM / 256GB SSD', '8GB RAM / 512GB SSD', '16GB RAM / 512GB SSD']
              }
            ],
            createdById: 2,
            updatedById: 2,
            deletedById: null,
            deletedAt: null,
            createdAt: '2026-02-20T07:00:00.000Z',
            updatedAt: '2026-04-10T11:00:00.000Z',
            successOrders: 295
          },
          {
            id: 4,
            publishedAt: '2026-03-15T08:00:00.000Z',
            name: 'Dell XPS 15 9530',
            basePrice: 38000000,
            virtualPrice: 43000000,
            brandId: 3,
            images: [
              'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_659_40.png'
            ],
            variants: [
              {
                value: 'Cấu hình',
                options: ['Core i7 / 16GB / 512GB SSD', 'Core i7 / 32GB / 1TB SSD', 'Core i9 / 32GB / 1TB SSD']
              }
            ],
            createdById: 2,
            updatedById: null,
            deletedById: null,
            deletedAt: null,
            createdAt: '2026-03-10T08:00:00.000Z',
            updatedAt: '2026-03-15T08:00:00.000Z',
            successOrders: 143
          },
          {
            id: 5,
            publishedAt: null,
            name: 'ASUS ROG Zephyrus G14 2026',
            basePrice: 42000000,
            virtualPrice: 48000000,
            brandId: 4,
            images: [
              'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/l/a/laptop-asus-gaming-rog-zephyrus-duo-16-gx650pz-nm031w.png'
            ],
            variants: [
              {
                value: 'Cấu hình',
                options: ['Ryzen 9 / 16GB / 1TB SSD', 'Ryzen 9 / 32GB / 1TB SSD']
              },
              {
                value: 'Màu sắc',
                options: ['Eclipse Gray', 'Platinum White']
              }
            ],
            createdById: 3,
            updatedById: 3,
            deletedById: null,
            deletedAt: null,
            createdAt: '2026-04-18T10:00:00.000Z',
            updatedAt: '2026-04-20T14:00:00.000Z',
            successOrders: 0
          }
        ],
        revenueByDate: [
          { date: '2026-04-15', revenue: 98000000 },
          { date: '2026-04-16', revenue: 134000000 },
          { date: '2026-04-17', revenue: 76000000 },
          { date: '2026-04-18', revenue: 189000000 },
          { date: '2026-04-19', revenue: 112000000 },
          { date: '2026-04-20', revenue: 156000000 },
          { date: '2026-04-21', revenue: 80000000 }
        ]
      },
      message: 'Lấy dữ liệu thành công'
    }
  }
  const revenue = datas?.payload.data.revenue ?? 0
  const clientCount = datas?.payload.data.clientCount ?? 0
  const orderCount = datas?.payload.data.orderCount ?? 0
  const servingOrderCount = datas?.payload.data.servingOrderCount ?? 0
  const revenueByDate = datas?.payload.data.revenueByDate ?? []
  const productIndicator = datas?.payload.data.productIndicator ?? []
  const handlePreset = (preset: DatePreset) => {
    const now = new Date()
    const end = endOfDay(now)
    let start: Date
    switch (preset) {
      case 'today':
        start = startOfDay(now)
        break
      case '7d':
        start = startOfDay(subDays(now, 7))
        break
      case '30d':
        start = startOfDay(subDays(now, 30))
        break
      case 'month':
        start = startOfMonth(now)
        break
      default:
        return
    }
    setFromDate(start)
    setToDate(end)
    setActivePreset(preset)
  }

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
    setActivePreset(null)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-2'>
        <Button variant={activePreset === 'today' ? 'default' : 'outline'} onClick={() => handlePreset('today')}>
          Hôm nay
        </Button>
        <Button variant={activePreset === '7d' ? 'default' : 'outline'} onClick={() => handlePreset('7d')}>
          7 ngày
        </Button>
        <Button variant={activePreset === '30d' ? 'default' : 'outline'} onClick={() => handlePreset('30d')}>
          30 ngày
        </Button>
        <Button variant={activePreset === 'month' ? 'default' : 'outline'} onClick={() => handlePreset('month')}>
          Tháng này
        </Button>
      </div>
      <div className='flex flex-wrap gap-2'>
        <div className='flex items-center'>
          <span className='mr-2'>Từ</span>
          <Input
            type='datetime-local'
            placeholder='Từ ngày'
            className='text-sm'
            value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
            onChange={(event) => {
              setFromDate(new Date(event.target.value))
              setActivePreset(null)
            }}
          />
        </div>
        <div className='flex items-center'>
          <span className='mr-2'>Đến</span>
          <Input
            type='datetime-local'
            placeholder='Đến ngày'
            value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
            onChange={(event) => {
              setToDate(new Date(event.target.value))
              setActivePreset(null)
            }}
          />
        </div>
        <Button variant={'outline'} onClick={resetDateFilter}>
          Reset
        </Button>
        <Button
          variant={'outline'}
          disabled={!data}
          onClick={() => {
            if (!data) return
            exportDashboardCSV(
              {
                revenue,
                clientCount,
                orderCount,
                servingOrderCount,
                revenueByDate,
                productIndicator
              },
              fromDate,
              toDate
            )
          }}
        >
          Xuất CSV
        </Button>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng doanh thu</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(revenue)}</div>
            <p className='text-xs text-muted-foreground'>Trong khoảng thời gian đã chọn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Khách</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{clientCount}</div>
            <p className='text-xs text-muted-foreground'>Mua hàng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đơn hàng</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <rect width='20' height='14' x='2' y='5' rx='2' />
              <path d='M2 10h20' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{orderCount}</div>
            <p className='text-xs text-muted-foreground'>Tổng số đơn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đơn đang phục vụ</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{servingOrderCount}</div>
            <p className='text-xs text-muted-foreground'>Hiện tại</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Giá trị TB/đơn</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <rect x='4' y='2' width='16' height='20' rx='2' />
              <line x1='8' y1='6' x2='16' y2='6' />
              <line x1='8' y1='10' x2='16' y2='10' />
              <line x1='8' y1='14' x2='12' y2='14' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(orderCount > 0 ? Math.round(revenue / orderCount) : 0)}
            </div>
            <p className='text-xs text-muted-foreground'>Doanh thu / Số đơn</p>
          </CardContent>
        </Card>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <div className='lg:col-span-4'>
          <RevenueLineChart chartData={revenueByDate} />
        </div>
        <div className='lg:col-span-3'>
          <DishBarChart chartData={productIndicator} />
        </div>
      </div>
      <TopDishesTable productIndicator={productIndicator} />
    </div>
  )
}
