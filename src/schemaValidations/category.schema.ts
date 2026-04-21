import z from 'zod'

export const CreateCategoryBody = z.object({
  name: z.string().min(1).max(256),
  logo: z.string(),
  parentCategoryId: z.number().nullable().optional(),
})

export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>

export const CategorySchema = z.object({
  id: z.number(),
  parentCategoryId: z.number().nullable(),
  name: z.string(),
  logo: z.string(),
})

export const CategoryTranslationSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  name: z.string().max(500),
  description: z.string(),
  languageId: z.string(),
})

export const CategoryRes = CategorySchema.extend({
  childrenCategories: z.array(CategorySchema).optional(),
  categoryTranslations: z.array(CategoryTranslationSchema).optional(),
})

export type CategoryResType = z.TypeOf<typeof CategoryRes>

export const CategoryListRes = z.object({
  data: z.array(
    CategorySchema.extend({
      childrenCategories: z.array(CategorySchema).optional(),
    }),
  ),
  totalItems: z.number(),
})

export type CategoryListResType = z.TypeOf<typeof CategoryListRes>

export const UpdateCategoryBody = CreateCategoryBody
export type UpdateCategoryBodyType = CreateCategoryBodyType
export const CategoryParams = z.object({
  id: z.coerce.number()
})
export type CategoryParamsType = z.TypeOf<typeof CategoryParams>
