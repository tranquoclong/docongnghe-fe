import { toast } from '@/components/ui/use-toast'
import { EntityError } from '@/lib/http'
import { type ClassValue, clsx } from 'clsx'
import { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { jwtDecode } from 'jwt-decode'
import authApiRequest from '@/apiRequests/auth'
import { DishStatus, OrderStatus, Role, TableStatus } from '@/constants/type'
import envConfig, { defaultLocale } from '@/config'
import { TokenPayload } from '@/types/jwt.types'
import guestApiRequest from '@/apiRequests/guest'
import { format } from 'date-fns'
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react'
import { io } from 'socket.io-client'
import slugify from 'slugify'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Xóa đi ký tự `/` đầu tiên của path
 */
export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}

export const handleErrorApi = <T extends FieldValues = FieldValues>({
  error,
  setError,
  duration
}: {
  error: unknown
  setError?: UseFormSetError<T>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field as Path<T>, {
        type: 'server',
        message: item.message
      })
    })
  } else {
    const message =
      error instanceof Error
        ? (error as { payload?: { message?: string } }).payload?.message ?? error.message
        : 'Lỗi không xác định'
    toast({
      title: 'Lỗi',
      description: message,
      variant: 'destructive',
      duration: duration ?? 5000
    })
  }
}

const isBrowser = typeof window !== 'undefined'

export const getAccessTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem('accessToken') : null)

export const getRefreshTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem('refreshToken') : null)
export const setAccessTokenToLocalStorage = (value: string) => isBrowser && localStorage.setItem('accessToken', value)

export const setRefreshTokenToLocalStorage = (value: string) => isBrowser && localStorage.setItem('refreshToken', value)
export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem('accessToken')
  isBrowser && localStorage.removeItem('refreshToken')
}
export const checkAndRefreshToken = async (param?: {
  onError?: () => void
  onSuccess?: () => void
  force?: boolean
}) => {
  // Không nên đưa logic lấy access và refresh token ra khỏi cái function `checkAndRefreshToken`
  // Vì để mỗi lần mà checkAndRefreshToken() được gọi thì chúng ta se có một access và refresh token mới
  // Tránh hiện tượng bug nó lấy access và refresh token cũ ở lần đầu rồi gọi cho các lần tiếp theo
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()
  // Chưa đăng nhập thì cũng không cho chạy
  if (!accessToken || !refreshToken) return
  const decodedAccessToken = decodeToken(accessToken)
  const decodedRefreshToken = decodeToken(refreshToken)
  // Thời điểm hết hạn của token là tính theo epoch time (s)
  // Còn khi các bạn dùng cú pháp new Date().getTime() thì nó sẽ trả về epoch time (ms)
  const now = Math.round(new Date().getTime() / 1000)
  // trường hợp refresh token hết hạn thì cho logout
  if (decodedRefreshToken.exp <= now) {
    removeTokensFromLocalStorage()
    return param?.onError && param.onError()
  }
  // Ví dụ access token của chúng ta có thời gian hết hạn là 10s
  // thì mình sẽ kiểm tra còn 1/3 thời gian (3s) thì mình sẽ cho refresh token lại
  // Thời gian còn lại sẽ tính dựa trên công thức: decodedAccessToken.exp - now
  // Thời gian hết hạn của access token dựa trên công thức: decodedAccessToken.exp - decodedAccessToken.iat
  if (param?.force || decodedAccessToken.exp - now < (decodedAccessToken.exp - decodedAccessToken.iat) / 3) {
    // Gọi API refresh token
    try {
      // const role = decodedRefreshToken.roleName
      // const res = role === Role.Guest ? await guestApiRequest.refreshToken() : await authApiRequest.refreshToken()
      const res = await authApiRequest.refreshToken()
      setAccessTokenToLocalStorage(res.payload.accessToken)
      setRefreshTokenToLocalStorage(res.payload.refreshToken)
      param?.onSuccess && param.onSuccess()
    } catch (error) {
      param?.onError && param.onError()
    }
  }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number)
}

export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return 'Có sẵn'
    case DishStatus.Unavailable:
      return 'Không có sẵn'
    default:
      return 'Ẩn'
  }
}

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.CANCELLED:
      return 'Đã hủy'
    case OrderStatus.DELIVERED:
      return 'Đã phục vụ'
    case OrderStatus.PENDING_DELIVERY:
      return 'Đang giao hàng'
    case OrderStatus.PENDING_PAYMENT:
      return 'Chờ thanh toán'
    case OrderStatus.PENDING_PICKUP:
      return 'Đang lấy hàng'
    case OrderStatus.RETURNED:
      return 'Đã trả hàng'
    default:
      return 'Đã hủy'
  }
}

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return 'Có sẵn'
    case TableStatus.Reserved:
      return 'Đã đặt'
    default:
      return 'Ẩn'
  }
}

export const getTableLink = ({ token, tableNumber }: { token: string; tableNumber: number }) => {
  return envConfig.NEXT_PUBLIC_URL + `/${defaultLocale}/tables/` + tableNumber + '?token=' + token
}

export const decodeToken = (token: string) => {
  return jwtDecode(token) as TokenPayload
}

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(removeAccents(matchText.trim().toLowerCase()))
}

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss dd/MM/yyyy')
}

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm')
}

export const generateSocketInstance = (accessToken: string) => {
  return io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
    auth: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

export const OrderStatusIcon = {
  [OrderStatus.CANCELLED]: Loader,
  [OrderStatus.DELIVERED]: CookingPot,
  [OrderStatus.PENDING_DELIVERY]: BookX,
  [OrderStatus.PENDING_PAYMENT]: Truck,
  [OrderStatus.PENDING_PICKUP]: HandCoins,
  [OrderStatus.RETURNED]: HandCoins
}

export const wrapServerApi = async <T>(fn: () => Promise<T>) => {
  let result = null
  try {
    result = await fn()
  } catch (error: unknown) {
    if (error instanceof Error && 'digest' in error && typeof (error as { digest?: string }).digest === 'string' && (error as { digest: string }).digest.includes('NEXT_REDIRECT')) {
      throw error
    }
  }
  return result
}

export const generateSlugUrl = ({ name, id }: { name: string; id: number }) => {
  if (!name.trim()) return id.toString()
  return `${slugify(name, { lower: true, locale: 'vi' })}-${id}`
}

export const getIdFromSlugUrl = (slug: string) => {
  if (!slug) return NaN
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]
  if (!lastPart) return NaN
  const id = Number(lastPart)
  return isNaN(id) ? NaN : id
}

type VariantItem = {
  value: string
  options: string[]
}

type SKU = {
  value: string
  price: number
  stock: number
  image: string
}


export const generateSKUs = (variants: VariantItem[]): SKU[] => {
  if (!variants || variants.length === 0) return []
  const filledVariants = variants.filter((v) => v.value.trim() && v.options.some((o) => o.trim()))
  if (filledVariants.length === 0) return []

  const combos = filledVariants.reduce<string[][]>((acc, variant) => {
    const validOpts = variant.options.filter((o) => o.trim())
    if (acc.length === 0) return validOpts.map((opt) => [opt])
    return acc.flatMap((combo) => validOpts.map((opt) => [...combo, opt]))
  }, [])

  return combos.map((combo) => ({
    value: combo.join('-'),
    price: 0,
    stock: 100,
    image: ''
  }))
}

export const mergeSKUs = (newSkus: SKU[], oldSkus: SKU[]): SKU[] => {
  const oldMap = new Map(oldSkus.map((s) => [s.value, s]))
  return newSkus.map((sku) => oldMap.get(sku.value) ?? sku)
}
