import z from 'zod'
import { SKUSIncludeProductSchema } from './product.schema'

export const CreateCartBody = z.object({
  skuId: z.number(),
  quantity: z.number(),
})

export type CreateCartBodyType = z.TypeOf<typeof CreateCartBody>

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  skuId: z.number(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sku: SKUSIncludeProductSchema
})

export const ShopSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string()
})

export const CartSchema = z.object({
  shop: ShopSchema,
  cartItems: z.array(CartItemSchema)
})


export const CartRes = CartItemSchema.pick({
  id: true,
  quantity: true,
  skuId: true,
  userId: true
})

export type CartResType = z.TypeOf<typeof CartRes>

export const CartListRes = z.object({
  data: z.array(CartSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export type CartListResType = z.TypeOf<typeof CartListRes>

export const UpdateCartBody = CreateCartBody
export type UpdateCartBodyType = CreateCartBodyType
export const CartParams = z.object({
  id: z.coerce.number()
})
export type CartParamsType = z.TypeOf<typeof CartParams>
