import http from '@/lib/http'
import {
    CartListResType,
    CartResType,
    CreateCartBodyType,
    UpdateCartBodyType
} from '@/schemaValidations/cart.schema'

const cartApiRequest = {
    list: () => http.get<CartListResType>('cart?page=1&limit=100', { next: { tags: ['cart'] } }),
    add: (body: CreateCartBodyType) => http.post<CartResType>('cart', body),
    updateCart: (cartItemId: number, body: UpdateCartBodyType) =>
        http.put<CartResType>(`cart/${cartItemId}`, body),
    deleteCart: (body: { cartItemIds: number[] }) => http.post<{ message: string }>(`cart/delete`, body)
}

export default cartApiRequest
