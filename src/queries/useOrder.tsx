import orderApiRequest from '@/apiRequests/order'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useOrderListQuery = () => {
  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: orderApiRequest.list
  })
}

export const useGetOrderQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderApiRequest.getOrder(id),
    enabled
  })
}

export const useAddOrderMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orderApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all
      })
    }
  })
}

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => orderApiRequest.CancelOrder(id),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.orders.detail(variables.id), data)
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
        predicate: (query) => query.queryKey.length === 1
      })
    }
  })
}

export const useManageOrderListQuery = () => {
  return useQuery({
    queryKey: queryKeys.orders.manage,
    queryFn: orderApiRequest.listManage
  })
}

export const useManageGetOrderQuery = ({ id, userId, enabled }: { id: number; userId: number; enabled: boolean }) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderApiRequest.getOrderManage(id, userId),
    enabled
  })
}

export const useChangeStatusOrderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId, status }: { id: number; userId: number; status: string }) =>
      orderApiRequest.changeStatus(id, userId, status),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.orders.detail(variables.id), data)
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.manage,
        predicate: (query) => query.queryKey.length === 1
      })
    }
  })
}
