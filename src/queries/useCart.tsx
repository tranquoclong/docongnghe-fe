import cartApiRequest from '@/apiRequests/cart'
import { UpdateCartBodyType } from '@/schemaValidations/cart.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useCartListQuery = () => {
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: cartApiRequest.list
  })
}

export const useAddCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.all
      })
    }
  })
}

export const useUpdateCartMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateCartBodyType & { id: number }) => cartApiRequest.updateCart(id, body),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.cart.detail(variables.id), data)

      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.all,
        predicate: (query) => query.queryKey.length === 1
      })
    }
  })
}

export const useDeleteCartMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cartApiRequest.deleteCart,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.all
      })
    }
  })
}
