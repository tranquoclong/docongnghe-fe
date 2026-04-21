import voucherApiRequest from '@/apiRequests/voucher'
import { UpdateVoucherBodyType } from '@/schemaValidations/voucher.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

// client
export const useVoucherListAvailableQuery = () => {
  return useQuery({
    queryKey: queryKeys.vouchers.all,
    queryFn: voucherApiRequest.list
  })
}

export const useMyVouchersQuery = () => {
  return useQuery({
    queryKey: queryKeys.vouchers.all,
    queryFn: voucherApiRequest.myVouchers
  })
}

export const useMyVouchersStatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.vouchers.all,
    queryFn: voucherApiRequest.myVouchersStats
  })
}

export const useGetVoucherByCodeQuery = ({ code, enabled }: { code: string; enabled: boolean }) => {
  return useQuery({
    queryKey: queryKeys.vouchers.code(code),
    queryFn: () => voucherApiRequest.getVoucherByCode(code),
    enabled
  })
}

export const useGetVoucherByIdQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: queryKeys.vouchers.detail(id),
    queryFn: () => voucherApiRequest.getVoucherById(id),
    enabled
  })
}

export const useCollectVoucherMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: voucherApiRequest.collectVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vouchers.all
      })
    }
  })
}

// admin
export const useGetVoucherListManageQuery = () => {
  return useQuery({
    queryKey: queryKeys.vouchers.manage,
    queryFn: voucherApiRequest.listManage
  })
}

export const useAddVoucherMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: voucherApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vouchers.manage
      })
    }
  })
}

export const useUpdateVoucherMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateVoucherBodyType & { id: number }) => voucherApiRequest.updateVoucher(id, body),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.vouchers.detail(variables.id), data)

      queryClient.invalidateQueries({
        queryKey: queryKeys.vouchers.manage,
        predicate: (query) => query.queryKey.length === 1
      })
    }
  })
}

export const useDeleteVoucherMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: voucherApiRequest.deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vouchers.manage
      })
    }
  })
}
