// import { ProductStatusValues } from '@/constants/type'
import z, { object } from 'zod'
import { BrandRes } from './brand.schema'
import { CategoryRes } from './category.schema'

export const VariantSchema = z.object({
  value: z.string().trim(),
  options: z.array(z.string().trim()),
})

export const VariantsSchema = z.array(VariantSchema)
// .superRefine((variants, ctx) => {
//   for (let i = 0; i < variants.length; i++) {
//     const variant = variants[i]
//     const isExistingVariant = variants.findIndex((v) => v.value.toLowerCase() === variant.value.toLowerCase()) !== i
//     if (isExistingVariant) {
//       return ctx.addIssue({
//         code: 'custom',
//         message: `Giá trị ${variant.value} đã tồn tại trong danh sách variants. Vui lòng kiểm tra lại.`,
//         path: ['variants'],
//       })
//     }
//     const isDifferentOption = variant.options.some((option, index) => {
//       const isExistingOption = variant.options.findIndex((o) => o.toLowerCase() === option.toLowerCase()) !== index
//       return isExistingOption
//     })
//     if (isDifferentOption) {
//       return ctx.addIssue({
//         code: 'custom',
//         message: `Variant ${variant.value} chứa các option trùng tên với nhau. Vui lòng kiểm tra lại.`,
//         path: ['variants'],
//       })
//     }
//   }
// })

export const ProductSchema = z.object({
  id: z.number(),
  publishedAt: z.iso.datetime().nullable(),
  name: z.string().trim().max(500),
  basePrice: z.coerce.number(),
  virtualPrice: z.coerce.number(),
  brandId: z.coerce.number(),
  // basePrice: z.number().min(0),
  // virtualPrice: z.number().min(0),
  // brandId: z.number().positive(),
  images: z.array(z.string()),
  variants: VariantsSchema,

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const ProductTranslationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  name: z.string().max(500),
  description: z.string(),
  languageId: z.string(),
})

export const SKUSchema = z.object({
  id: z.number(),
  value: z.string().trim(),
  price: z.number().min(0),
  stock: z.number().min(0),
  image: z.string(),
  productId: z.number(),
})

export const UpsertSKUBodySchema = SKUSchema.pick({
  value: true,
  price: true,
  stock: true,
  image: true,
})

export type UpsertSKUBodyType = z.infer<typeof UpsertSKUBodySchema>

const SpecItemSchema = z.object({
  key: z.string().min(1, 'Key không được trống'),
  // label: z.string().min(1, 'Tên chỉ số không được trống'),
  // value: z.string().min(1, 'Giá trị không được trống'),
  translations: z.array(z.object({
    languageId: z.string(),
    label: z.string().min(1, 'Tên chỉ số không được trống'),
    value: z.string().min(1, 'Giá trị không được trống'),
  })),
})

const SpecGroupSchema = z.object({
  key: z.string().min(1, 'Key nhóm không được trống'),
  // label: z.string().min(1, 'Tên nhóm không được trống'),
  sortOrder: z.number().int().nonnegative().default(0),
  translations: z.array(z.object({
    languageId: z.string(),
    label: z.string().min(1, 'Tên nhóm không được trống'),
  })),
  specs: z.array(SpecItemSchema).min(1, 'Nhóm phải có ít nhất 1 chỉ số'),
})

const HighlightSectionSchema = z.object({
  heading: z.string().min(1, 'Tiêu đề không được trống'),
  content: z.string().min(1, 'Nội dung không được trống'),
  sortOrder: z.number().int().nonnegative(),
})

const HighlightsSchema = z.object({
  languageId: z.string(),
  summary: z.string(),
  sections: z.array(HighlightSectionSchema),
})

export const CreateProductBody = ProductSchema.pick({
  publishedAt: true,
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  variants: true,
})
  .extend({
    publishedAt: z.string().optional().nullable(),
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
    specGroups: z.array(SpecGroupSchema),
    highlights: z.array(HighlightsSchema)
  })

export type CreateProductBodyType = z.TypeOf<typeof CreateProductBody>

export type SpecItemType = z.TypeOf<typeof SpecItemSchema>
export type SpecGroupType = z.TypeOf<typeof SpecGroupSchema>
export type HighlightSectionType = z.TypeOf<typeof HighlightSectionSchema>
export type HighlightsType = z.TypeOf<typeof HighlightsSchema>

export const SKUSIncludeProductSchema = SKUSchema.extend({
  product: ProductSchema,
})

export type SKUSchemaType = z.infer<typeof SKUSIncludeProductSchema>
export type SKUSResType = z.infer<typeof SKUSchema>

export const ProductRes = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema.extend({
    highlights: z
      .object({
        summary: z.string(),
        sections: z.array(
          z.object({
            heading: z.string(),
            content: z.string(),
            sortOrder: z.number(),
          })
        ),
      })
      .nullable(),
  })),
  // skus: z.array(SKUSIncludeProductSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryRes),
  brand: BrandRes,
  specGroups: z.array(z.object({
    id: z.number(),
    sortOrder: z.number().int().nonnegative().optional().default(0),
    key: z.string().min(1),
  }).extend({
    translations: z.array(
      z.object({
        id: z.number(),
        languageId: z.string(),
        label: z.string().min(1),
      })
    ),
    specs: z.array(z.object({
      id: z.number(),
      key: z.string().min(1),
      sortOrder: z.number().int().nonnegative().optional().default(0),
    }).extend({
      translations: z.array(
        z.object({
          id: z.number(),
          languageId: z.string(),
          label: z.string().min(1),
          value: z.string(),
        })
      ),
    })).min(1)
  })),

})

export type ProductResType = z.TypeOf<typeof ProductRes>

export const ProductListRes = z.object({
  data: z.array(
    ProductSchema.extend({
      categories: z.array(CategoryRes),
      productTranslations: z.array(ProductTranslationSchema),
      _count: z
        .object({
          orders: z.number(),
        })
        .optional(),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export type ProductListResType = z.TypeOf<typeof ProductListRes>

export const UpdateProductBody = CreateProductBody
export type UpdateProductBodyType = CreateProductBodyType
export const ProductParams = z.object({
  id: z.coerce.number()
})
export type ProductParamsType = z.TypeOf<typeof ProductParams>
