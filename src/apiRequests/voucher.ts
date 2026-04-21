import http from '@/lib/http'
import {
  VoucherListAvailableResType,
  GetVoucherByCodeResType,
  CreateVoucherBodyType,
  VoucherListResType,
  UpdateVoucherBodyType,
  CollectVoucherResType,
  ListMyVouchersResType,
  DeleteVoucherResType,
  GetVoucherStatsResType,
  CreateVoucherResType,
  UpdateVoucherResType
} from '@/schemaValidations/voucher.schema'

const voucherApiRequest = {
  // client
  list: () => http.get<VoucherListAvailableResType>('vouchers/available?page=1&limit=100&type=PERCENTAGE', { next: { tags: ['vouchers'] } }),
  myVouchers: () => http.get<ListMyVouchersResType>('vouchers/my?page=1&limit=10&status=available', { next: { tags: ['vouchers'] } }),
  myVouchersStats: () => http.get<GetVoucherStatsResType>('vouchers/my/stats', { next: { tags: ['vouchers'] } }),
  getVoucherByCode: (code: string) =>
    http.get<GetVoucherByCodeResType>(`vouchers/code/${code}`, {
      next: { tags: ['vouchers', `voucher-${code}`] }
    }),
  getVoucherById: (id: number) =>
    http.get<GetVoucherByCodeResType>(`vouchers/${id}`, {
      next: { tags: ['vouchers', `voucher-${id}`] }
    }),
  collectVoucher: (id: number) => http.post<CollectVoucherResType>(`vouchers/${id}/collect`, {}),
  // admin
  listManage: () =>
    http.get<VoucherListResType>('vouchers/manage?page=1&limit=100', { next: { tags: ['manage-vouchers'] } }),
  add: (body: CreateVoucherBodyType) => http.post<CreateVoucherResType>('vouchers/manage', body),
  getVoucherManageStats: () =>
    http.get<GetVoucherStatsResType>(`vouchers/manage/stats`, {
      next: { tags: ['vouchers', `manage-voucher-stats`] }
    }),
  updateVoucher: (id: number, body: UpdateVoucherBodyType) =>
    http.put<UpdateVoucherResType>(`vouchers/manage/${id}`, body),
  deleteVoucher: (id: number) => http.delete<DeleteVoucherResType>(`vouchers/manage/${id}`)
}

export default voucherApiRequest
