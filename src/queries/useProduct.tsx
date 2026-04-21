import productApiRequest from '@/apiRequests/product'
import { UpdateProductBodyType } from '@/schemaValidations/product.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useProductListQuery = () => {
  return useQuery({
    queryKey: queryKeys.products.all,
    queryFn: productApiRequest.list
  })
}

export const useGetProductQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productApiRequest.getProduct(id),
    enabled
  })
}

export const useAddProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all
      })
    }
  })
}

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateProductBodyType & { id: number }) => productApiRequest.updateProduct(id, body),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.products.detail(variables.id), data)

      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
        predicate: (query) => query.queryKey.length === 1
      })
    }
  })
}

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productApiRequest.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all
      })
    }
  })
}
