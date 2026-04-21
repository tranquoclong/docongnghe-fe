import z from 'zod'

export const VoucherTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y'])
export type VoucherType = z.infer<typeof VoucherTypeSchema>

export const VoucherSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: VoucherTypeSchema,
  value: z.number(),
  minOrderValue: z.number().nullable(),
  maxDiscount: z.number().nullable(),
  usageLimit: z.number().nullable(),
  usedCount: z.number(),
  userUsageLimit: z.number().nullable(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  isActive: z.boolean(),
  sellerId: z.number().nullable(),
  applicableProducts: z.array(z.number()),
  excludedProducts: z.array(z.number()),
})


// ===== CREATE VOUCHER (Admin/Seller Only) =====
export const VoucherBaseSchema = z.object({
  code: z
    .string()
    .min(3, 'Mã voucher phải có ít nhất 3 ký tự')
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, 'Mã voucher chỉ được chứa chữ hoa, số, _ và -'),
  name: z.string().min(1, 'Tên voucher không được để trống').max(500),
  description: z.string().optional(),
  type: VoucherTypeSchema,
  value: z.number().positive('Giá trị voucher phải lớn hơn 0'),
  minOrderValue: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  userUsageLimit: z.number().int().positive().optional().default(1),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  isActive: z.boolean().optional().default(true),
  applicableProducts: z.array(z.number().int().positive()).optional().default([]),
  excludedProducts: z.array(z.number().int().positive()).optional().default([]),
})

export const CreateVoucherBody = VoucherBaseSchema.refine((data) => data.endDate > data.startDate, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDate'],
}).refine(
  (data) => {
    if (data.type === 'PERCENTAGE' && data.value > 100) {
      return false
    }
    return true
  },
  {
    message: 'Voucher giảm theo % không được vượt quá 100%',
    path: ['value'],
  },
)

export const CreateVoucherResponseSchema = z.object({
  data: VoucherSchema,
})

export type CreateVoucherBodyType = z.infer<typeof CreateVoucherBody>
export type CreateVoucherResType = z.infer<typeof CreateVoucherResponseSchema>

// ===== UPDATE VOUCHER =====
export const UpdateVoucherParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const UpdateVoucherBody = VoucherBaseSchema.partial()
  .omit({ code: true })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
        path: ['endDate'],
      })
    }

    if (data.type === 'PERCENTAGE' && data.value !== undefined && data.value > 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'Voucher giảm theo % không được vượt quá 100%',
        path: ['value'],
      })
    }
  })
export const UpdateVoucherResponseSchema = z.object({
  data: VoucherSchema,
})

export type UpdateVoucherBodyType = z.infer<typeof UpdateVoucherBody>
export type UpdateVoucherResType = z.infer<typeof UpdateVoucherResponseSchema>


export const VoucherRes = VoucherSchema.extend({
  userVoucher: z
    .object({
      usedCount: z.number(),
      savedAt: z.iso.datetime(),
      canUse: z.boolean(),
    })
    .nullable(),
  isCollected: z.boolean(),
  canApply: z.boolean(),
})

export type VoucherResType = z.TypeOf<typeof VoucherRes>

export const VoucherStatsRes = z.object({
  totalVouchers: z.number(),
  activeVouchers: z.number(),
  collectedVouchers: z.number(),
  usedVouchers: z.number(),
})

export type VoucherStatsResType = z.TypeOf<typeof VoucherStatsRes>

export const UserVoucherRes = z.object({
  id: z.number(),
  userId: z.number(),
  voucherId: z.number(),
  usedCount: z.number(),
  usedAt: z.iso.datetime().nullable(),
  savedAt: z.iso.datetime(),
  voucher: VoucherSchema,
})

export const CollectVoucherRes = z.object({
  data: UserVoucherRes,
})

export type UserVoucherResType = z.TypeOf<typeof UserVoucherRes>
export type CollectVoucherResType = z.TypeOf<typeof CollectVoucherRes>

export const VoucherListRes = z.object({
  data: z.array(VoucherSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export const VoucherListAvailableRes = z.object({
  data: z.array(VoucherRes),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export const ListMyVouchersRes = VoucherListRes.extend({
  data: z.array(UserVoucherRes),
})


export type VoucherListResType = z.TypeOf<typeof VoucherListRes>
export type VoucherListAvailableResType = z.TypeOf<typeof VoucherListAvailableRes>
export type ListMyVouchersResType = z.TypeOf<typeof ListMyVouchersRes>

export const VoucherApplicationResultSchema = z.object({
  canApply: z.boolean(),
  discountAmount: z.number(),
  reason: z.string().optional(),
  voucher: VoucherSchema.optional(),
})

export const GetVoucherByCodeRes = z.object({
  data: VoucherRes,
})

export type GetVoucherByCodeResType = z.TypeOf<typeof GetVoucherByCodeRes>

export const DeleteVoucherRes = z.object({
  message: z.string(),
})

export type DeleteVoucherResType = z.TypeOf<typeof DeleteVoucherRes>

// ===== VOUCHER STATS =====
export const GetVoucherStatsResponse = z.object({
  data: VoucherStatsRes,
})

export type GetVoucherStatsResType = z.TypeOf<typeof GetVoucherStatsResponse>
