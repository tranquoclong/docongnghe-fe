'use client'
import { useCartListQuery, useDeleteCartMutation, useUpdateCartMutation } from '@/queries/useCart'
import { useAddOrderMutation } from '@/queries/useOrder'
import {
  useCollectVoucherMutation,
  useGetVoucherByCodeQuery,
  useMyVouchersQuery,
  useVoucherListAvailableQuery
} from '@/queries/useVoucher'
import { CartListResType, CartItemSchema } from '@/schemaValidations/cart.schema'
import { formatCurrency, handleErrorApi } from '@/lib/utils'
import { UserVoucherResType, VoucherResType, VoucherSchema } from '@/schemaValidations/voucher.schema'
import Image from 'next/image'
import { useState, useCallback, useMemo, useRef } from 'react'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  MapPin,
  X,
  Loader2,
  TicketPercent,
  PackageCheck,
  Search,
  Gift,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bookmark
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { z } from 'zod'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { useRouter } from '@/i18n/routing'

type VoucherItem = z.infer<typeof VoucherSchema>
type CartItem = z.infer<typeof CartItemSchema>
type ShopGroup = CartListResType['data'][0]

interface ReceiverState {
  name: string
  phone: string
  address: string
}

interface ShopOrderState {
  receiver: ReceiverState
  appliedVoucher: VoucherItem | null
}

const defaultShopState = (): ShopOrderState => ({
  receiver: { name: '', phone: '', address: '' },
  appliedVoucher: null
})

// ─── Voucher helpers ──────────────────────────────────────────────────────────

function VoucherTypeIcon({ type }: { type: string }) {
  if (type === 'PERCENTAGE') return <span className='text-purple-500 font-bold text-sm'>%</span>
  if (type === 'FIXED_AMOUNT') return <span className='text-blue-500 font-bold text-sm'>₫</span>
  if (type === 'FREE_SHIPPING') return <span className='text-green-500 text-sm'>🚚</span>
  return <Gift className='w-4 h-4 text-orange-500' />
}

function VoucherValueLabel({ type, value, maxDiscount }: { type: string; value: number; maxDiscount: number | null }) {
  if (type === 'PERCENTAGE')
    return (
      <span>
        Giảm {value}%{maxDiscount ? ` tối đa ${formatCurrency(maxDiscount)}` : ''}
      </span>
    )
  if (type === 'FIXED_AMOUNT') return <span>Giảm {formatCurrency(value)}</span>
  if (type === 'FREE_SHIPPING') return <span>Miễn phí vận chuyển</span>
  return <span>Mua X tặng Y</span>
}

// ─── Voucher card ─────────────────────────────────────────────────────────────

function VoucherCard({
  voucher,
  isSelected,
  onSelect,
  disabled,
  insufficientAmount
}: {
  voucher: VoucherItem
  isSelected: boolean
  onSelect: (v: VoucherItem | null) => void
  disabled?: boolean
  insufficientAmount?: number
}) {
  const endDate = new Date(voucher.endDate)
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysLeft <= 3
  const isInsufficient = insufficientAmount !== undefined && insufficientAmount > 0
  const isDisabled = disabled || isInsufficient

  return (
    <button
      type='button'
      disabled={isDisabled}
      onClick={() => onSelect(isSelected ? null : voucher)}
      className={`w-full text-left rounded-lg border transition-all ${
        isSelected
          ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
          : isInsufficient
            ? 'border-border bg-muted/20 opacity-70 cursor-not-allowed'
            : disabled
              ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
              : 'border-border bg-card hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/10'
      }`}
    >
      <div className='flex items-stretch'>
        <div
          className={`w-1 rounded-l-lg shrink-0 ${
            isSelected ? 'bg-orange-400' : isInsufficient ? 'bg-muted-foreground/10' : 'bg-muted-foreground/20'
          }`}
        />
        <div
          className={`flex items-center justify-center w-10 shrink-0 border-r border-dashed ${
            isSelected ? 'border-orange-300' : 'border-border'
          }`}
        >
          <VoucherTypeIcon type={voucher.type} />
        </div>
        <div className='flex-1 px-3 py-2 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0'>
              <p className={`text-xs font-semibold truncate ${isInsufficient ? 'text-muted-foreground' : ''}`}>
                {voucher.name}
              </p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                <VoucherValueLabel type={voucher.type} value={voucher.value} maxDiscount={voucher.maxDiscount} />
              </p>
              {voucher.minOrderValue && (
                <p className='text-xs text-muted-foreground'>Đơn tối thiểu {formatCurrency(voucher.minOrderValue)}</p>
              )}
              {isInsufficient && (
                <p className='text-xs text-amber-600 dark:text-amber-400 mt-0.5'>
                  Cần mua thêm {formatCurrency(insufficientAmount)} để dùng
                </p>
              )}
            </div>
            {isSelected && <CheckCircle2 className='w-4 h-4 text-orange-500 shrink-0 mt-0.5' />}
          </div>
          <div className='flex items-center gap-1 mt-1'>
            <Clock className={`w-3 h-3 ${isExpiringSoon ? 'text-red-400' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${isExpiringSoon ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
              {isExpiringSoon ? `Còn ${daysLeft} ngày` : endDate.toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Voucher panel per shop ───────────────────────────────────────────────────

function ShopVoucherPanel({
  shopId,
  shopState,
  selectedItems,
  onStateChange
}: {
  shopId: number
  shopState: ShopOrderState
  selectedItems: CartItem[]
  onStateChange: (shopId: number, patch: Partial<ShopOrderState>) => void
}) {
  const [searchCode, setSearchCode] = useState('')
  const [searchEnabled, setSearchEnabled] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [collectingId, setCollectingId] = useState<number | null>(null)
  const prevSearchCode = useRef('')

  const { data: myVouchersData, isLoading: myLoading } = useMyVouchersQuery()
  const { data: availableData } = useVoucherListAvailableQuery()
  const collectMutation = useCollectVoucherMutation()

  const {
    data: searchData,
    isFetching: isSearching,
    error: searchError
  } = useGetVoucherByCodeQuery({
    code: searchCode,
    enabled: searchEnabled && searchCode.length >= 3
  })

  const myVouchers = (myVouchersData?.payload?.data ?? [])
    .map((uv: UserVoucherResType) => uv.voucher)
    .filter(Boolean) as VoucherItem[]

  const availableVouchers: VoucherResType[] = availableData?.payload?.data ?? []

  const subtotal = selectedItems.reduce((s, i) => s + i.sku.price * i.quantity, 0)

  // Vouchers đủ điều kiện hoàn toàn
  const eligibleVouchers = myVouchers.filter((v) => {
    if (!v.isActive) return false
    if (new Date(v.endDate) < new Date()) return false
    if (v.minOrderValue && subtotal < v.minOrderValue) return false
    return true
  })

  // Vouchers chưa đủ tiền (active, chưa hết hạn, nhưng subtotal < minOrderValue)
  const insufficientVouchers = myVouchers.filter((v) => {
    if (!v.isActive) return false
    if (new Date(v.endDate) < new Date()) return false
    if (!v.minOrderValue) return false
    return subtotal < v.minOrderValue
  })

  // Eligible hiển thị trước, insufficient hiển thị sau
  const allMyVouchers = [...eligibleVouchers, ...insufficientVouchers]
  const displayedVouchers = showAll ? allMyVouchers : allMyVouchers.slice(0, 3)

  const myVoucherIds = new Set(myVouchers.map((v) => v.id))
  const collectableVouchers = availableVouchers.filter((v) => !myVoucherIds.has(v.id)).slice(0, 3)

  // Handle search state
  if (searchEnabled && !isSearching && searchData && searchCode !== prevSearchCode.current) {
    prevSearchCode.current = searchCode
  }

  const searchedVoucher: VoucherResType | null = searchData?.payload?.data ?? null
  const searchNotFound = searchEnabled && !isSearching && (searchError || !searchedVoucher)
  const searchedAlreadyCollected = searchedVoucher ? myVoucherIds.has(searchedVoucher.id) : false

  const handleSearch = () => {
    if (!searchCode.trim()) return
    prevSearchCode.current = ''
    setSearchEnabled(true)
  }

  const handleCollect = async (voucherId: number) => {
    setCollectingId(voucherId)
    try {
      await collectMutation.mutateAsync(voucherId)
      toast({ description: 'Đã lưu voucher! Voucher sẵn sàng sử dụng.' })
      setSearchCode('')
      setSearchEnabled(false)
      prevSearchCode.current = ''
    } catch {
      toast({ variant: 'destructive', description: 'Không thể lưu voucher.' })
    } finally {
      setCollectingId(null)
    }
  }

  const handleSelectVoucher = (v: VoucherItem | null) => {
    onStateChange(shopId, { appliedVoucher: v })
  }

  if (selectedItems.length === 0) return null

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
        <TicketPercent className='w-3.5 h-3.5' />
        <span>Voucher</span>
      </div>

      {/* Applied badge */}
      {shopState.appliedVoucher && (
        <div className='flex items-center justify-between rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/20 px-3 py-2'>
          <div className='flex items-center gap-2'>
            <Tag className='w-3.5 h-3.5 text-orange-500' />
            <span className='text-xs font-semibold text-orange-600 dark:text-orange-400'>
              {shopState.appliedVoucher.code}
            </span>
            <span className='text-xs text-orange-400'>·</span>
            <span className='text-xs text-orange-600 dark:text-orange-400'>
              <VoucherValueLabel
                type={shopState.appliedVoucher.type}
                value={shopState.appliedVoucher.value}
                maxDiscount={shopState.appliedVoucher.maxDiscount}
              />
            </span>
          </div>
          <button
            type='button'
            onClick={() => handleSelectVoucher(null)}
            className='text-muted-foreground hover:text-destructive transition-colors'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>
      )}

      {/* Search by code */}
      <div className='space-y-2'>
        <div className='flex gap-2'>
          <Input
            placeholder='Tìm voucher theo mã...'
            value={searchCode}
            onChange={(e) => {
              setSearchCode(e.target.value.toUpperCase())
              setSearchEnabled(false)
              prevSearchCode.current = ''
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className='h-8 text-xs'
          />
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='h-8 text-xs px-3 shrink-0 gap-1'
            onClick={handleSearch}
            disabled={isSearching || !searchCode.trim()}
          >
            {isSearching ? <Loader2 className='w-3 h-3 animate-spin' /> : <Search className='w-3 h-3' />}
          </Button>
        </div>

        {/* Search result */}
        {searchEnabled && !isSearching && (
          <>
            {searchNotFound && <p className='text-xs text-destructive px-1'>Không tìm thấy voucher với mã này.</p>}
            {searchedVoucher && (
              <div className='rounded-lg border border-border bg-muted/20 p-3 space-y-2'>
                <div className='flex items-start gap-2'>
                  <VoucherTypeIcon type={searchedVoucher.type} />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      <span className='text-xs font-semibold'>{searchedVoucher.code}</span>
                      {searchedAlreadyCollected && (
                        <Badge
                          variant='secondary'
                          className='text-xs py-0 px-1.5 text-green-700 bg-green-50 border-green-200 dark:text-green-400'
                        >
                          Đã lưu
                        </Badge>
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>{searchedVoucher.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      <VoucherValueLabel
                        type={searchedVoucher.type}
                        value={searchedVoucher.value}
                        maxDiscount={searchedVoucher.maxDiscount}
                      />
                    </p>
                  </div>
                </div>
                {!searchedAlreadyCollected && (
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-7 text-xs gap-1 w-full border-orange-300 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/20'
                    onClick={() => handleCollect(searchedVoucher.id)}
                    disabled={collectingId === searchedVoucher.id}
                  >
                    {collectingId === searchedVoucher.id ? (
                      <>
                        <Loader2 className='w-3 h-3 animate-spin' />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Bookmark className='w-3 h-3' />
                        Lưu để dùng
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Separator />

      {/* My vouchers */}
      <div className='space-y-2'>
        <p className='text-xs font-medium text-muted-foreground'>Voucher của tôi</p>
        {myLoading ? (
          <div className='space-y-2'>
            {[1, 2].map((i) => (
              <div key={i} className='h-16 bg-muted animate-pulse rounded-lg' />
            ))}
          </div>
        ) : allMyVouchers.length === 0 ? (
          <div className='rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center space-y-1.5'>
            <TicketPercent className='w-5 h-5 text-muted-foreground mx-auto' />
            <p className='text-xs text-muted-foreground'>Chưa có voucher nào</p>
          </div>
        ) : (
          <div className='space-y-1.5'>
            {displayedVouchers.map((v) => {
              const insufficientAmount =
                v.minOrderValue && subtotal < v.minOrderValue ? v.minOrderValue - subtotal : undefined
              return (
                <VoucherCard
                  key={v.id}
                  voucher={v}
                  isSelected={shopState.appliedVoucher?.id === v.id}
                  onSelect={handleSelectVoucher}
                  insufficientAmount={insufficientAmount}
                />
              )
            })}
            {allMyVouchers.length > 3 && (
              <button
                type='button'
                onClick={() => setShowAll(!showAll)}
                className='w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-1'
              >
                {showAll ? (
                  <>
                    <ChevronUp className='w-3 h-3' />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown className='w-3 h-3' />
                    Xem thêm {allMyVouchers.length - 3} voucher
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Collectable vouchers */}
      {collectableVouchers.length > 0 && (
        <>
          <Separator />
          <div className='space-y-2'>
            <p className='text-xs font-medium text-muted-foreground'>Voucher có thể lưu</p>
            <div className='space-y-1.5'>
              {collectableVouchers.map((v) => (
                <div
                  key={v.id}
                  className='rounded-lg border border-dashed border-border bg-muted/10 flex items-stretch'
                >
                  <div className='w-1 rounded-l-lg bg-muted-foreground/20 shrink-0' />
                  <div className='flex items-center justify-center w-10 shrink-0 border-r border-dashed border-border'>
                    <VoucherTypeIcon type={v.type} />
                  </div>
                  <div className='flex-1 px-3 py-2 min-w-0'>
                    <p className='text-xs font-semibold truncate'>{v.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      <VoucherValueLabel type={v.type} value={v.value} maxDiscount={v.maxDiscount} />
                    </p>
                  </div>
                  <div className='flex items-center pr-3 shrink-0'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-7 text-xs gap-1 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 px-2'
                      onClick={() => handleCollect(v.id)}
                      disabled={collectingId === v.id}
                    >
                      {collectingId === v.id ? (
                        <Loader2 className='w-3 h-3 animate-spin' />
                      ) : (
                        <>
                          <Bookmark className='w-3 h-3' />
                          Lưu
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Quantity stepper ─────────────────────────────────────────────────────────

function QuantityStepper({
  item,
  onUpdate,
  disabled
}: {
  item: CartItem
  onUpdate: (id: number, qty: number) => void
  disabled?: boolean
}) {
  return (
    <div className='flex items-center gap-1'>
      <button
        type='button'
        onClick={() => onUpdate(item.id, item.quantity - 1)}
        disabled={disabled || item.quantity <= 1}
        className='w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
      >
        <Minus className='w-3 h-3' />
      </button>
      <span className='w-8 text-center text-sm font-medium tabular-nums'>{item.quantity}</span>
      <button
        type='button'
        onClick={() => onUpdate(item.id, item.quantity + 1)}
        disabled={disabled}
        className='w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
      >
        <Plus className='w-3 h-3' />
      </button>
    </div>
  )
}

// ─── Cart item row ────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  checked,
  onCheck,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting
}: {
  item: CartItem
  checked: boolean
  onCheck: (id: number, checked: boolean) => void
  onUpdate: (id: number, qty: number) => void
  onDelete: (id: number) => void
  isUpdating: boolean
  isDeleting: boolean
}) {
  const { sku } = item
  const product = sku.product
  const image = sku.image || product?.images?.[0] || ''
  const skuLabel = sku.value ? sku.value.split('-').join(' · ') : ''

  return (
    <div className={`flex items-start gap-3 py-3 transition-opacity ${isDeleting ? 'opacity-40' : ''}`}>
      <div className='pt-0.5 flex-shrink-0'>
        <Checkbox checked={checked} onCheckedChange={(v) => onCheck(item.id, !!v)} className='rounded' />
      </div>
      <div className='relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-muted'>
        {image ? (
          <Image src={image} fill alt={product?.name ?? ''} className='object-cover' sizes='56px' />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
            <ShoppingBag className='w-4 h-4' />
          </div>
        )}
      </div>
      <div className='flex-1 min-w-0 space-y-0.5'>
        <p className='text-sm font-medium leading-snug line-clamp-2'>{product?.name ?? 'Sản phẩm'}</p>
        {skuLabel && <p className='text-xs text-muted-foreground'>{skuLabel}</p>}
        <p className='text-sm font-semibold text-orange-500'>{formatCurrency(sku.price)}</p>
      </div>
      <div className='flex flex-col items-end gap-2 flex-shrink-0'>
        <button
          type='button'
          onClick={() => onDelete(item.id)}
          disabled={isDeleting}
          className='text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40'
        >
          <Trash2 className='w-3.5 h-3.5' />
        </button>
        <QuantityStepper item={item} onUpdate={onUpdate} disabled={isUpdating} />
        <p className='text-xs text-muted-foreground tabular-nums'>= {formatCurrency(sku.price * item.quantity)}</p>
      </div>
    </div>
  )
}

// ─── Shop group card (left) ───────────────────────────────────────────────────

function ShopGroupCard({
  shop,
  cartItems,
  selectedIds,
  onCheck,
  onCheckAll,
  onUpdate,
  onDelete,
  updatingIds,
  deletingIds
}: {
  shop: ShopGroup['shop']
  cartItems: CartItem[]
  selectedIds: Set<number>
  onCheck: (id: number, checked: boolean) => void
  onCheckAll: (items: CartItem[], checked: boolean) => void
  onUpdate: (id: number, qty: number) => void
  onDelete: (id: number) => void
  updatingIds: Set<number>
  deletingIds: Set<number>
}) {
  const allChecked = cartItems.every((i) => selectedIds.has(i.id))
  const someChecked = cartItems.some((i) => selectedIds.has(i.id))

  return (
    <div className='rounded-xl border border-border bg-card overflow-hidden'>
      <div className='flex items-center gap-2.5 px-4 py-2.5 bg-muted/30 border-b border-border'>
        <Checkbox
          checked={allChecked}
          ref={(el) => {
            if (el) {
              const input = el.querySelector?.('input') as HTMLInputElement | null
              if (input) input.indeterminate = someChecked && !allChecked
            }
          }}
          onCheckedChange={(v) => onCheckAll(cartItems, !!v)}
          className='rounded'
        />
        {shop.avatar && (
          <Image
            src={shop.avatar}
            width={18}
            height={18}
            alt={shop.name}
            className='rounded-full object-cover border border-border'
          />
        )}
        <span className='text-sm font-semibold'>{shop.name}</span>
      </div>
      <div className='divide-y divide-border px-4'>
        {cartItems.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            checked={selectedIds.has(item.id)}
            onCheck={onCheck}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isUpdating={updatingIds.has(item.id)}
            isDeleting={deletingIds.has(item.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Receiver form ────────────────────────────────────────────────────────────

function ReceiverForm({
  shopId,
  shopState,
  shopName,
  onStateChange
}: {
  shopId: number
  shopState: ShopOrderState
  shopName: string
  onStateChange: (shopId: number, patch: Partial<ShopOrderState>) => void
}) {
  const { receiver } = shopState
  const set = (field: keyof ReceiverState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onStateChange(shopId, { receiver: { ...receiver, [field]: e.target.value } })

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
        <MapPin className='w-3.5 h-3.5' />
        <span>Nhận hàng · {shopName}</span>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Họ tên *</Label>
          <Input placeholder='Nguyễn Văn A' value={receiver.name} onChange={set('name')} className='h-8 text-xs' />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Số điện thoại *</Label>
          <Input placeholder='0901234567' value={receiver.phone} onChange={set('phone')} className='h-8 text-xs' />
        </div>
      </div>
      <div className='space-y-1'>
        <Label className='text-xs text-muted-foreground'>Địa chỉ *</Label>
        <Input
          placeholder='123 Đường ABC, Quận 1, TP.HCM'
          value={receiver.address}
          onChange={set('address')}
          className='h-8 text-xs'
        />
      </div>
    </div>
  )
}

// ─── Order panel ──────────────────────────────────────────────────────────────

function OrderPanel({
  cartData,
  selectedIds,
  shopStates,
  onSelectAll,
  onDeleteSelected,
  onPlaceOrder,
  isDeletingSelected,
  isOrdering
}: {
  cartData: CartListResType['data']
  selectedIds: Set<number>
  shopStates: Record<number, ShopOrderState>
  onSelectAll: (checked: boolean) => void
  onDeleteSelected: () => void
  onPlaceOrder: () => void
  isDeletingSelected: boolean
  isOrdering: boolean
  onShopStateChange: (shopId: number, patch: Partial<ShopOrderState>) => void
}) {
  const allItems = cartData.flatMap((g) => g.cartItems)
  const allChecked = allItems.length > 0 && allItems.every((i) => selectedIds.has(i.id))
  const someChecked = allItems.some((i) => selectedIds.has(i.id))
  const selectedItems = allItems.filter((i) => selectedIds.has(i.id))
  const totalQty = selectedItems.reduce((s, i) => s + i.quantity, 0)
  const subtotal = selectedItems.reduce((s, i) => s + i.sku.price * i.quantity, 0)

  const totalDiscount = useMemo(
    () =>
      cartData.reduce((sum, group) => {
        const state = shopStates[group.shop.id]
        if (!state?.appliedVoucher) return sum
        const shopSelected = group.cartItems.filter((i) => selectedIds.has(i.id))
        const shopSubtotal = shopSelected.reduce((s, i) => s + i.sku.price * i.quantity, 0)
        const v = state.appliedVoucher
        if (v.type === 'PERCENTAGE') {
          const d = shopSubtotal * (v.value / 100)
          return sum + (v.maxDiscount ? Math.min(d, v.maxDiscount) : d)
        }
        if (v.type === 'FIXED_AMOUNT') return sum + Math.min(v.value, shopSubtotal)
        return sum
      }, 0),
    [cartData, shopStates, selectedIds]
  )

  const grandTotal = Math.max(0, subtotal - totalDiscount)

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <label className='flex items-center gap-2 cursor-pointer text-sm select-none'>
          <Checkbox checked={allChecked} onCheckedChange={(v) => onSelectAll(!!v)} className='rounded' />
          <span>Chọn tất cả ({allItems.length})</span>
        </label>
        {someChecked && (
          <button
            type='button'
            onClick={onDeleteSelected}
            disabled={isDeletingSelected}
            className='flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50'
          >
            <Trash2 className='w-3 h-3' />
            Xóa đã chọn
          </button>
        )}
      </div>
      <Separator />
      <div className='space-y-2'>
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>Tạm tính ({totalQty})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {totalDiscount > 0 && (
          <div className='flex justify-between text-sm text-green-600 dark:text-green-400'>
            <span>Giảm giá</span>
            <span>-{formatCurrency(totalDiscount)}</span>
          </div>
        )}
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>Vận chuyển</span>
          <span className='text-green-600 dark:text-green-400'>Miễn phí</span>
        </div>
        <Separator />
        <div className='flex justify-between font-semibold'>
          <span>Tổng cộng</span>
          <span className='text-orange-500 text-lg'>{formatCurrency(grandTotal)}</span>
        </div>
      </div>
      <Button
        className='w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0'
        disabled={selectedIds.size === 0 || isOrdering}
        onClick={onPlaceOrder}
      >
        {isOrdering ? (
          <>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            Đang đặt hàng...
          </>
        ) : selectedIds.size === 0 ? (
          'Chọn sản phẩm để đặt hàng'
        ) : (
          <>
            <PackageCheck className='w-4 h-4 mr-2' />
            Đặt hàng ({totalQty} sản phẩm)
          </>
        )}
      </Button>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCart({ router }: { router: any }) {
  return (
    <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
      <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
        <ShoppingBag className='w-8 h-8 text-muted-foreground' />
      </div>
      <div className='space-y-1'>
        <p className='font-medium'>Giỏ hàng trống</p>
        <p className='text-sm text-muted-foreground'>Thêm sản phẩm vào giỏ để bắt đầu mua sắm</p>
      </div>
      <Button variant='outline' size='sm' onClick={() => router.push('/products')}>
        Tiếp tục mua sắm
      </Button>
    </div>
  )
}

// ─── Main CartDetail ──────────────────────────────────────────────────────────

export default function CartDetail() {
  const router = useRouter()
  const { data, isLoading } = useCartListQuery()
  const updateCartMutation = useUpdateCartMutation()
  const deleteCartMutation = useDeleteCartMutation()
  const addOrderMutation = useAddOrderMutation()

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [isDeletingSelected, setIsDeletingSelected] = useState(false)
  const [shopStates, setShopStates] = useState<Record<number, ShopOrderState>>({})

  const cartData = data?.payload.data ?? []

  const getShopState = useCallback(
    (shopId: number): ShopOrderState => shopStates[shopId] ?? defaultShopState(),
    [shopStates]
  )

  const handleShopStateChange = useCallback((shopId: number, patch: Partial<ShopOrderState>) => {
    setShopStates((prev) => ({
      ...prev,
      [shopId]: { ...(prev[shopId] ?? defaultShopState()), ...patch }
    }))
  }, [])

  const handleCheck = useCallback((id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const n = new Set(prev)
      checked ? n.add(id) : n.delete(id)
      return n
    })
  }, [])

  const handleCheckAll = useCallback((items: CartItem[], checked: boolean) => {
    setSelectedIds((prev) => {
      const n = new Set(prev)
      items.forEach((i) => (checked ? n.add(i.id) : n.delete(i.id)))
      return n
    })
  }, [])

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set(cartData.flatMap((g) => g.cartItems.map((i) => i.id))) : new Set())
    },
    [cartData]
  )

  const handleUpdate = useCallback(
    async (id: number, quantity: number) => {
      if (quantity < 1) return
      setUpdatingIds((prev) => new Set(prev).add(id))
      try {
        const skuId = cartData.flatMap((g) => g.cartItems).find((i) => i.id === id)!.skuId
        await updateCartMutation.mutateAsync({ id, skuId, quantity })
      } catch {
        toast({ variant: 'destructive', description: 'Không thể cập nhật số lượng.' })
      } finally {
        setUpdatingIds((prev) => {
          const n = new Set(prev)
          n.delete(id)
          return n
        })
      }
    },
    [cartData, updateCartMutation]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      setDeletingIds((prev) => new Set(prev).add(id))
      setSelectedIds((prev) => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
      try {
        await deleteCartMutation.mutateAsync({ cartItemIds: [id] })
      } catch {
        toast({ variant: 'destructive', description: 'Không thể xóa sản phẩm.' })
      } finally {
        setDeletingIds((prev) => {
          const n = new Set(prev)
          n.delete(id)
          return n
        })
      }
    },
    [deleteCartMutation]
  )

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return
    setIsDeletingSelected(true)
    const ids = Array.from(selectedIds)
    setSelectedIds(new Set())
    try {
      await deleteCartMutation.mutateAsync({ cartItemIds: ids })
    } catch {
      toast({ variant: 'destructive', description: 'Không thể xóa các sản phẩm đã chọn.' })
    } finally {
      setIsDeletingSelected(false)
    }
  }, [selectedIds, deleteCartMutation])

  const handlePlaceOrder = useCallback(async () => {
    const shopsWithSelected = cartData.filter((g) => g.cartItems.some((i) => selectedIds.has(i.id)))
    for (const group of shopsWithSelected) {
      const { receiver } = getShopState(group.shop.id)
      if (!receiver.name.trim() || !receiver.phone.trim() || !receiver.address.trim()) {
        toast({
          variant: 'destructive',
          description: `Vui lòng điền đầy đủ thông tin nhận hàng cho shop "${group.shop.name}".`
        })
        return
      }
    }
    const body = shopsWithSelected.map((group) => {
      const state = getShopState(group.shop.id)
      return {
        shopId: group.shop.id,
        receiver: state.receiver,
        cartItemIds: group.cartItems.filter((i) => selectedIds.has(i.id)).map((i) => i.id),
        ...(state.appliedVoucher ? { voucherId: state.appliedVoucher.id } : {})
      }
    })
    try {
      await addOrderMutation.mutateAsync(body)
      await revalidateApiRequest('orders')
      await revalidateApiRequest('cart')
      setSelectedIds(new Set())
      setShopStates({})
      toast({ description: 'Đặt hàng thành công!' })
      router.push('/client/orders')
    } catch (error) {
      handleErrorApi({ error })
    }
  }, [cartData, selectedIds, getShopState, addOrderMutation, router])

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6'>
        <div className='space-y-3'>
          {[1, 2].map((i) => (
            <div key={i} className='rounded-xl border border-border p-4 space-y-3 animate-pulse'>
              <div className='h-4 w-24 bg-muted rounded' />
              <div className='flex gap-3'>
                <div className='w-14 h-14 bg-muted rounded-lg flex-shrink-0' />
                <div className='flex-1 space-y-2'>
                  <div className='h-3 bg-muted rounded w-3/4' />
                  <div className='h-3 bg-muted rounded w-1/2' />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='rounded-xl border border-border p-5 space-y-4 animate-pulse h-fit'>
          <div className='h-4 bg-muted rounded w-1/2' />
          <div className='h-32 bg-muted rounded' />
          <div className='h-11 bg-muted rounded-xl' />
        </div>
      </div>
    )
  }

  if (cartData.length === 0) return <EmptyCart router={router} />

  const shopsWithSelected = cartData.filter((g) => g.cartItems.some((i) => selectedIds.has(i.id)))

  return (
    <div className='grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start'>
      {/* ── Left: product list ── */}
      <div className='space-y-3'>
        {cartData.map((group) => (
          <ShopGroupCard
            key={group.shop.id}
            shop={group.shop}
            cartItems={group.cartItems}
            selectedIds={selectedIds}
            onCheck={handleCheck}
            onCheckAll={handleCheckAll}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            updatingIds={updatingIds}
            deletingIds={deletingIds}
          />
        ))}
      </div>

      {/* ── Right: voucher + receiver + summary ── */}
      <div className='space-y-4 lg:sticky lg:top-4'>
        {/* Voucher & receiver per selected shop */}
        {shopsWithSelected.length > 0 && (
          <div className='rounded-xl border border-border bg-card p-5 space-y-6'>
            {shopsWithSelected.map((group, idx) => {
              const shopState = getShopState(group.shop.id)
              const selectedItems = group.cartItems.filter((i) => selectedIds.has(i.id))
              return (
                <div key={group.shop.id}>
                  {idx > 0 && <Separator className='mb-6' />}
                  <div className='flex items-center gap-2 mb-4'>
                    {group.shop.avatar && (
                      <Image
                        src={group.shop.avatar}
                        width={18}
                        height={18}
                        alt={group.shop.name}
                        className='rounded-full border border-border'
                      />
                    )}
                    <span className='text-sm font-semibold'>{group.shop.name}</span>
                  </div>
                  <div className='space-y-5'>
                    <ShopVoucherPanel
                      shopId={group.shop.id}
                      shopState={shopState}
                      selectedItems={selectedItems}
                      onStateChange={handleShopStateChange}
                    />
                    <Separator />
                    <ReceiverForm
                      shopId={group.shop.id}
                      shopState={shopState}
                      shopName={group.shop.name}
                      onStateChange={handleShopStateChange}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Order summary */}
        <div className='rounded-xl border border-border bg-card p-5'>
          <OrderPanel
            cartData={cartData}
            selectedIds={selectedIds}
            shopStates={shopStates}
            onSelectAll={handleSelectAll}
            onDeleteSelected={handleDeleteSelected}
            onPlaceOrder={handlePlaceOrder}
            isDeletingSelected={isDeletingSelected}
            isOrdering={addOrderMutation.isPending}
            onShopStateChange={handleShopStateChange}
          />
        </div>
      </div>
    </div>
  )
}
