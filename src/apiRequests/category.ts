import http from '@/lib/http'
import {
  CreateCategoryBodyType,
  CategoryListResType,
  CategoryResType,
  UpdateCategoryBodyType
} from '@/schemaValidations/category.schema'

const categoryApiRequest = {
  list: () =>
    http.get<CategoryListResType>('categories?page=1&limit=100', { next: { tags: ['categories'] } }),
  add: (body: CreateCategoryBodyType) => http.post<CategoryResType>('categories', body),
  getCategory: (id: number) =>
    http.get<CategoryResType>(`categories/${id}`, {
      next: { tags: ['categories', `category-${id}`] }
    }),
  updateCategory: (id: number, body: UpdateCategoryBodyType) =>
    http.put<CategoryResType>(`categories/${id}`, body),
  deleteCategory: (id: number) => http.delete<CategoryResType>(`categories/${id}`)
}

export default categoryApiRequest
