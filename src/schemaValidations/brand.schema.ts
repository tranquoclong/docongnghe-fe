import z from 'zod'

export const CreateBrandBody = z.object({
  name: z.string().min(1).max(256),
  logo: z.string(),
})

export type CreateBrandBodyType = z.TypeOf<typeof CreateBrandBody>

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
})

export const BrandTranslationSchema = z.object({
  id: z.number(),
  brandId: z.number(),
  name: z.string().max(500),
  description: z.string(),
  languageId: z.string(),
})

export const BrandRes = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema).optional(),
})

export type BrandResType = z.TypeOf<typeof BrandRes>

export const BrandListRes = z.object({
  data: z.array(BrandSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export type BrandListResType = z.TypeOf<typeof BrandListRes>

export const UpdateBrandBody = CreateBrandBody
export type UpdateBrandBodyType = CreateBrandBodyType
export const BrandParams = z.object({
  id: z.coerce.number()
})
export type BrandParamsType = z.TypeOf<typeof BrandParams>
