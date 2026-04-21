import { OrderStatusValues } from '@/constants/type'
import z from 'zod'

export const OrderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  status: z.enum(OrderStatusValues),
  receiver: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
  }),
  shopId: z.number().nullable(),
  paymentId: z.number(),

  // Enhanced Order Flow Fields
  addressId: z.number().nullable().optional(),
  shippingFee: z.number().default(0).optional(),
  totalAmount: z.number().default(0),
  notes: z.string().nullable().optional(),
  estimatedDelivery: z.iso.datetime().nullable().optional(),
  voucherId: z.number().nullable().optional(),
  discountAmount: z.number().default(0).optional(),

})

export const ProductSKUSnapshotSchema = z.object({
  id: z.number(),
  productId: z.number().nullable(),
  productName: z.string(),
  productTranslations: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      languageId: z.string(),
    }),
  ),
  skuPrice: z.number(),
  image: z.string(),
  skuValue: z.string(),
  skuId: z.number().nullable(),
  orderId: z.number().nullable(),
  quantity: z.number(),

  createdAt: z.iso.datetime(),
})

export const CreateOrderBody = z
  .array(
    z.object({
      shopId: z.number(),
      receiver: z.object({
        name: z.string(),
        phone: z.string().min(9).max(20),
        address: z.string(),
      }),
      cartItemIds: z.array(z.number()).min(1),
      voucherId: z.number().optional(),
    }),
  )
  .min(1)

export type CreateOrderBodyType = z.TypeOf<typeof CreateOrderBody>

export const OrderRes = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
})

export type OrderResType = z.TypeOf<typeof OrderRes>

export const OrderListRes = z.object({
  data: z.array(
    OrderSchema.extend({
      items: z.array(ProductSKUSnapshotSchema),
    })
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export type OrderListResType = z.TypeOf<typeof OrderListRes>

export const UpdateOrderBody = CreateOrderBody

export const OrderParams = z.object({
  id: z.coerce.number()
})
export type OrderParamsType = z.TypeOf<typeof OrderParams>
