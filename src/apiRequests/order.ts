import http from '@/lib/http'
import {
  CreateOrderBodyType,
  OrderListResType,
  OrderResType,
} from '@/schemaValidations/order.schema'

const orderApiRequest = {
  list: () =>
    http.get<OrderListResType>('orders', { next: { tags: ['orders'] } }),
  add: (body: CreateOrderBodyType) => http.post<OrderResType>('orders', body),
  getOrder: (id: number) =>
    http.get<OrderResType>(`orders/${id}`, {
      next: { tags: ['orders', `order-${id}`] }
    }),
  CancelOrder: (id: number) => http.put<OrderResType>(`orders/${id}`, {}),

  listManage: () =>
    http.get<OrderListResType>('manage-order/orders?page=1&limit=100', { next: { tags: ['manage-order'] } }),
  getOrderManage: (id: number, userId: number) =>
    http.get<OrderResType>(`manage-order/orders/${id}/user/${userId}`, {
      next: { tags: ['manage-order', `order-${id}`] }
    }),
  changeStatus: (id: number, userId: number, status: string) => http.put<OrderResType>(`manage-order/orders/${id}/status/${userId}`, { status }),
}

export default orderApiRequest
