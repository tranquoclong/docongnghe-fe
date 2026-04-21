'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { useCancelOrderMutation, useOrderListQuery } from '@/queries/useOrder'
import { OrderListResType } from '@/schemaValidations/order.schema'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  RotateCcw,
  XCircle,
  ChevronRight,
  ShoppingBag,
  AlertCircle
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Order = OrderListResType['data'][0]
type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatusType,
  {
    label: string
    icon: React.ElementType
    badgeClass: string
    iconClass: string
    bgClass: string
  }
> = {
  [OrderStatus.PENDING_PAYMENT]: {
    label: 'Chờ thanh toán',
    icon: Clock,
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    iconClass: 'text-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/20'
  },
  [OrderStatus.PENDING_PICKUP]: {
    label: 'Chờ lấy hàng',
    icon: Package,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-950/20'
  },
  [OrderStatus.PENDING_DELIVERY]: {
    label: 'Đang giao hàng',
    icon: Truck,
    badgeClass:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
    iconClass: 'text-indigo-500',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/20'
  },
  [OrderStatus.DELIVERED]: {
    label: 'Đã giao hàng',
    icon: CheckCircle2,
    badgeClass:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800',
    iconClass: 'text-green-500',
    bgClass: 'bg-green-50 dark:bg-green-950/20'
  },
  [OrderStatus.RETURNED]: {
    label: 'Đã hoàn hàng',
    icon: RotateCcw,
    badgeClass:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
    iconClass: 'text-orange-500',
    bgClass: 'bg-orange-50 dark:bg-orange-950/20'
  },
  [OrderStatus.CANCELLED]: {
    label: 'Đã hủy',
    icon: XCircle,
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
    iconClass: 'text-red-500',
    bgClass: 'bg-red-50 dark:bg-red-950/20'
  }
}

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabValue = 'ALL' | OrderStatusType

const TABS: { value: TabValue; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: OrderStatus.PENDING_PAYMENT, label: 'Chờ TT' },
  { value: OrderStatus.PENDING_PICKUP, label: 'Chờ lấy' },
  { value: OrderStatus.PENDING_DELIVERY, label: 'Đang giao' },
  { value: OrderStatus.DELIVERED, label: 'Đã giao' },
  { value: OrderStatus.RETURNED, label: 'Hoàn hàng' },
  { value: OrderStatus.CANCELLED, label: 'Đã hủy' }
]

const CANCELLABLE_STATUSES: OrderStatusType[] = [OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING_PICKUP]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(isoString))
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatusType }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        cfg.badgeClass
      )}
    >
      <Icon className='w-3 h-3' />
      {cfg.label}
    </span>
  )
}

// ─── OrderProgress ────────────────────────────────────────────────────────────

const PROGRESS_STEPS: OrderStatusType[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PENDING_PICKUP,
  OrderStatus.PENDING_DELIVERY,
  OrderStatus.DELIVERED
]

function OrderProgress({ status }: { status: OrderStatusType }) {
  if (status === OrderStatus.CANCELLED || status === OrderStatus.RETURNED) return null

  const currentIdx = PROGRESS_STEPS.indexOf(status)

  return (
    <div className='flex items-center gap-0 w-full overflow-hidden'>
      {PROGRESS_STEPS.map((step, idx) => {
        const cfg = STATUS_CONFIG[step]
        const Icon = cfg.icon
        const isDone = idx <= currentIdx
        const isActive = idx === currentIdx

        return (
          <div key={step} className='flex items-center flex-1 min-w-0'>
            <div className='flex flex-col items-center gap-1 flex-shrink-0'>
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all',
                  isDone ? 'border-orange-500 bg-orange-500' : 'border-border bg-background'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isDone ? 'text-white' : 'text-muted-foreground')} />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium text-center leading-tight max-w-[56px] truncate hidden sm:block',
                  isActive ? 'text-orange-500' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/50'
                )}
              >
                {cfg.label}
              </span>
            </div>
            {idx < PROGRESS_STEPS.length - 1 && (
              <div
                className={cn('h-0.5 flex-1 mx-1 transition-all', idx < currentIdx ? 'bg-orange-500' : 'bg-border')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── CancelDialog ─────────────────────────────────────────────────────────────

function CancelDialog({
  orderId,
  onConfirm,
  isPending
}: {
  orderId: number
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40'
        >
          <XCircle className='w-3.5 h-3.5 mr-1' />
          Hủy đơn
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <AlertCircle className='w-5 h-5 text-red-500' />
            Xác nhận hủy đơn hàng
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn hủy đơn hàng #{orderId}? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Giữ đơn hàng</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className='bg-red-500 hover:bg-red-600 text-white'
          >
            {isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── OrderItems preview ───────────────────────────────────────────────────────

function OrderItemsPreview({ items, maxShow = 3 }: { items: Order['items']; maxShow?: number }) {
  const visible = items.slice(0, maxShow)
  const extra = items.length - maxShow

  return (
    <div className='flex items-center gap-2'>
      <div className='flex -space-x-2'>
        {visible.map((item, i) => (
          <div
            key={item.id}
            className='relative w-10 h-10 rounded-lg overflow-hidden border-2 border-background bg-muted flex-shrink-0'
            style={{ zIndex: visible.length - i }}
          >
            <Image
              src={item.image || '/placeholder.png'}
              fill
              alt={item.productName}
              className='object-cover'
              sizes='40px'
            />
          </div>
        ))}
        {extra > 0 && (
          <div
            className='w-10 h-10 rounded-lg border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0'
            style={{ zIndex: 0 }}
          >
            +{extra}
          </div>
        )}
      </div>
      <div className='min-w-0'>
        <p className='text-sm font-medium truncate'>{items[0]?.productName}</p>
        {items.length > 1 && <p className='text-xs text-muted-foreground'>và {items.length - 1} sản phẩm khác</p>}
      </div>
    </div>
  )
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onCancel,
  cancellingId
}: {
  order: Order
  onCancel: (id: number) => void
  cancellingId: number | null
}) {
  const cfg = STATUS_CONFIG[order.status]
  const isCancellable = CANCELLABLE_STATUSES.includes(order.status)
  const isPendingCancel = cancellingId === order.id
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className='rounded-2xl border border-border bg-card overflow-hidden hover:shadow-sm transition-shadow'>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-4 py-3 border-b border-border', cfg.bgClass)}>
        <div className='flex items-center gap-2.5 min-w-0'>
          <ShoppingBag className={cn('w-4 h-4 flex-shrink-0', cfg.iconClass)} />
          <span className='text-sm font-semibold truncate'>Đơn hàng #{order.id}</span>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Progress bar (non-terminal statuses) */}
      {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.RETURNED && (
        <div className='px-4 pt-4 pb-2'>
          <OrderProgress status={order.status} />
        </div>
      )}

      {/* Items */}
      <div className='px-4 py-3 space-y-2'>
        {order.items.map((item) => (
          <div key={item.id} className='flex items-center gap-3'>
            <div className='relative w-14 h-14 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0'>
              <Image
                src={item.image || '/placeholder.png'}
                fill
                alt={item.productName}
                className='object-cover'
                sizes='56px'
              />
            </div>
            <div className='flex-1 min-w-0 space-y-0.5'>
              <p className='text-sm font-medium leading-snug line-clamp-1'>{item.productName}</p>
              {item.skuValue && <p className='text-xs text-muted-foreground'>{item.skuValue.split('-').join(' · ')}</p>}
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-orange-500'>{formatCurrency(item.skuPrice)}</span>
                <span className='text-xs text-muted-foreground'>× {item.quantity}</span>
              </div>
            </div>
            <div className='text-right flex-shrink-0'>
              <p className='text-sm font-medium'>{formatCurrency(item.skuPrice * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider + totals */}
      <div className='mx-4 border-t border-dashed border-border' />

      <div className='px-4 py-3 space-y-1.5'>
        {(order.shippingFee ?? 0) > 0 && (
          <div className='flex justify-between text-sm text-muted-foreground'>
            <span>Phí vận chuyển</span>
            <span>{formatCurrency(order.shippingFee ?? 0)}</span>
          </div>
        )}
        {(order.discountAmount ?? 0) > 0 && (
          <div className='flex justify-between text-sm text-green-600 dark:text-green-400'>
            <span>Giảm giá voucher</span>
            <span>-{formatCurrency(order.discountAmount ?? 0)}</span>
          </div>
        )}
        <div className='flex justify-between items-center'>
          <span className='text-sm font-medium'>Tổng cộng</span>
          <span className='text-base font-bold text-orange-500'>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className='px-4 py-3 border-t border-border flex items-center justify-between gap-2 flex-wrap bg-muted/20'>
        <div className='space-y-0.5'>
          <p className='text-xs text-muted-foreground'>
            Giao tới: <span className='text-foreground font-medium'>{order.receiver?.name}</span>
          </p>
          <p className='text-xs text-muted-foreground truncate max-w-[240px]'>{order.receiver?.address}</p>
        </div>

        <div className='flex items-center gap-2 flex-shrink-0'>
          {isCancellable && (
            <CancelDialog orderId={order.id} onConfirm={() => onCancel(order.id)} isPending={isPendingCancel} />
          )}
          {order.status === OrderStatus.DELIVERED && (
            <Button size='sm' className='h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white'>
              Mua lại
            </Button>
          )}
          <Button variant='ghost' size='sm' className='h-8 text-xs gap-1'>
            Chi tiết
            <ChevronRight className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className='px-4 pb-3'>
          <p className='text-xs text-muted-foreground italic bg-muted/40 rounded-lg px-3 py-2'>
            Ghi chú: {order.notes}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className='rounded-2xl border border-border bg-card overflow-hidden animate-pulse'>
      <div className='h-12 bg-muted/50' />
      <div className='p-4 space-y-3'>
        <div className='flex gap-3'>
          <div className='w-14 h-14 rounded-xl bg-muted flex-shrink-0' />
          <div className='flex-1 space-y-2'>
            <div className='h-3.5 bg-muted rounded w-3/4' />
            <div className='h-3 bg-muted rounded w-1/2' />
            <div className='h-3 bg-muted rounded w-1/4' />
          </div>
        </div>
      </div>
      <div className='h-10 bg-muted/30 mx-4 mb-4 rounded-lg' />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyOrders({ tab }: { tab: TabValue }) {
  const label = tab === 'ALL' ? 'nào' : `"${STATUS_CONFIG[tab as OrderStatusType]?.label}"`
  return (
    <div className='flex flex-col items-center justify-center py-16 gap-4 text-center'>
      <div className='w-20 h-20 rounded-full bg-muted flex items-center justify-center'>
        <ShoppingBag className='w-10 h-10 text-muted-foreground/40' />
      </div>
      <div className='space-y-1.5'>
        <p className='font-semibold text-base'>Không có đơn hàng {label}</p>
        <p className='text-sm text-muted-foreground'>Các đơn hàng của bạn sẽ hiện ở đây</p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrdersCart() {
  const { data, isLoading } = useOrderListQuery()
  const cancelOrderMutation = useCancelOrderMutation()

  const [activeTab, setActiveTab] = useState<TabValue>('ALL')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const orderData = data?.payload.data ?? []

  // Count per tab for badge
  const countByStatus = useMemo(() => {
    const counts: Partial<Record<TabValue, number>> = { ALL: orderData.length }
    orderData.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1
    })
    return counts
  }, [orderData])

  // Filtered list
  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return orderData
    return orderData.filter((o) => o.status === activeTab)
  }, [orderData, activeTab])

  const handleCancel = async (id: number) => {
    setCancellingId(id)
    try {
      await cancelOrderMutation.mutateAsync({ id })
      toast({ description: `Đã hủy đơn hàng #${id} thành công.` })
    } catch {
      toast({ variant: 'destructive', description: 'Không thể hủy đơn hàng. Vui lòng thử lại.' })
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className='w-full max-w-2xl mx-auto space-y-4 px-0 sm:px-0'>
      {/* Tab navigation */}
      <div className='relative'>
        <div className='flex overflow-x-auto scrollbar-none border-b border-border -mx-4 sm:mx-0 px-4 sm:px-0'>
          {TABS.map((tab) => {
            const count = countByStatus[tab.value]
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                type='button'
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0',
                  isActive
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {tab.label}
                {!!count && count > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold',
                      isActive ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyOrders tab={activeTab} />
      ) : (
        <div className='space-y-4'>
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={handleCancel} cancellingId={cancellingId} />
          ))}
        </div>
      )}

      {/* Total count footer */}
      {!isLoading && filtered.length > 0 && (
        <p className='text-center text-xs text-muted-foreground py-2'>
          Hiển thị {filtered.length} / {orderData.length} đơn hàng
        </p>
      )}
    </div>
  )
}
