import categoryApiRequest from '@/apiRequests/category'
import { UpdateCategoryBodyType } from '@/schemaValidations/category.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useCategoryListQuery = () => {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: categoryApiRequest.list
  })
}

export const useGetCategoryQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoryApiRequest.getCategory(id),
    enabled
  })
}

export const useAddCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all
      })
    }
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateCategoryBodyType & { id: number }) => categoryApiRequest.updateCategory(id, body),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.categories.detail(variables.id), data)

      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
        predicate: (query) => query.queryKey.length === 1
      })
    }
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: categoryApiRequest.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all
      })
    }
  })
}
