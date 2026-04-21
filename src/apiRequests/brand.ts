import http from '@/lib/http'
import {
  CreateBrandBodyType,
  BrandListResType,
  BrandResType,
  UpdateBrandBodyType
} from '@/schemaValidations/brand.schema'

const brandApiRequest = {
  list: () =>
    http.get<BrandListResType>('brands?page=1&limit=100', { next: { tags: ['brands'] } }),
  add: (body: CreateBrandBodyType) => http.post<BrandResType>('brands', body),
  getBrand: (id: number) =>
    http.get<BrandResType>(`brands/${id}`, {
      next: { tags: ['brands', `brand-${id}`] }
    }),
  updateBrand: (id: number, body: UpdateBrandBodyType) =>
    http.put<BrandResType>(`brands/${id}`, body),
  deleteBrand: (id: number) => http.delete<BrandResType>(`brands/${id}`)
}

export default brandApiRequest
