import http from '@/lib/http'
import {
  CreateProductBodyType,
  ProductListResType,
  ProductResType,
  UpdateProductBodyType
} from '@/schemaValidations/product.schema'

const productApiRequest = {
  list: () =>
    http.get<ProductListResType>('products?page=1&limit=100', { next: { tags: ['products'] } }),
  getProduct: (id: number) =>
    http.get<ProductResType>(`products/${id}`, {
      next: { tags: ['products', `product-${id}`] }
    }),

  listManage: () =>
    http.get<ProductListResType>('manage-product/products?page=1&limit=100', { next: { tags: ['manage-products'] } }),
  add: (body: CreateProductBodyType) => http.post<ProductResType>('manage-product/products', body),
  getProductManage: (id: number) =>
    http.get<ProductResType>(`manage-product/products/${id}`, {
      next: { tags: ['products', `manage-product-${id}`] }
    }),
  updateProduct: (id: number, body: UpdateProductBodyType) =>
    http.put<ProductResType>(`manage-product/products/${id}`, body),
  deleteProduct: (id: number) => http.delete<ProductResType>(`manage-product/products/${id}`)
}

export default productApiRequest
