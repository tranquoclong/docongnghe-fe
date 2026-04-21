import brandApiRequest from '@/apiRequests/brand'
import { UpdateBrandBodyType } from '@/schemaValidations/brand.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useBrandListQuery = () => {
  return useQuery({
    queryKey: queryKeys.brands.all,
    queryFn: brandApiRequest.list
  })
}

export const useGetBrandQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: queryKeys.brands.detail(id),
    queryFn: () => brandApiRequest.getBrand(id),
    enabled
  })
}

export const useAddBrandMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: brandApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands.all
      })
    }
  })
}

export const useUpdateBrandMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateBrandBodyType & { id: number }) => brandApiRequest.updateBrand(id, body),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.brands.detail(variables.id), data)

      queryClient.invalidateQueries({
        queryKey: queryKeys.brands.all,
        predicate: (query) => query.queryKey.length === 1
      })
    }
  })
}

export const useDeleteBrandMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: brandApiRequest.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands.all
      })
    }
  })
}
