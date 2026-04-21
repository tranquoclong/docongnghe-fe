'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { handleErrorApi } from '@/lib/utils'
import { UpdateVoucherBody, UpdateVoucherBodyType } from '@/schemaValidations/voucher.schema'
import { useGetVoucherByIdQuery, useUpdateVoucherMutation } from '@/queries/useVoucher'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const VOUCHER_TYPES = [
  { value: 'PERCENTAGE', label: 'Giảm theo %' },
  { value: 'FIXED_AMOUNT', label: 'Giảm số tiền cố định' },
  { value: 'FREE_SHIPPING', label: 'Miễn phí vận chuyển' },
  { value: 'BUY_X_GET_Y', label: 'Mua X tặng Y' }
]

export default function EditVoucher({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const updateVoucherMutation = useUpdateVoucherMutation()
  const { data } = useGetVoucherByIdQuery({ enabled: Boolean(id), id: id as number })

  const form = useForm<UpdateVoucherBodyType>({
    resolver: zodResolver(UpdateVoucherBody) as any,
    defaultValues: {
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      isActive: true
    }
  })

  const voucherType = form.watch('type')

  useEffect(() => {
    if (data) {
      const v = data.payload.data
      form.reset({
        name: v.name,
        description: v.description ?? '',
        type: v.type,
        value: v.value,
        minOrderValue: v.minOrderValue ?? undefined,
        maxDiscount: v.maxDiscount ?? undefined,
        usageLimit: v.usageLimit ?? undefined,
        userUsageLimit: v.userUsageLimit ?? undefined,
        startDate: v.startDate,
        endDate: v.endDate,
        isActive: v.isActive,
        applicableProducts: v.applicableProducts,
        excludedProducts: v.excludedProducts
      })
    }
  }, [data, form])

  const reset = () => setId(undefined)

  const onSubmit = async (values: UpdateVoucherBodyType) => {
    if (updateVoucherMutation.isPending) return
    try {
      await updateVoucherMutation.mutateAsync({ id: id as number, ...values })
      await revalidateApiRequest('vouchers')
      toast({ description: 'Cập nhật voucher thành công!' })
      reset()
      onSubmitSuccess?.()
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) reset()
      }}
    >
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Cập nhật voucher</DialogTitle>
          <DialogDescription>Cập nhật thông tin voucher (không thể thay đổi mã voucher)</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid gap-4 py-4'
            id='edit-voucher-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='name'>Tên voucher</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input id='name' placeholder='VD: Sale mới 20%' {...field} />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='description'>Mô tả</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input id='description' placeholder='Mô tả ngắn về voucher' {...field} />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label>Loại voucher</Label>
                    <div className='col-span-3 space-y-1'>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại voucher' />
                        </SelectTrigger>
                        <SelectContent>
                          {VOUCHER_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Value */}
            <FormField
              control={form.control}
              name='value'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='value'>{voucherType === 'PERCENTAGE' ? 'Giá trị (%)' : 'Giá trị (₫)'}</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input
                        id='value'
                        type='number'
                        min={0}
                        max={voucherType === 'PERCENTAGE' ? 100 : undefined}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Min Order Value */}
            <FormField
              control={form.control}
              name='minOrderValue'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='minOrderValue'>Đơn tối thiểu (₫)</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input
                        id='minOrderValue'
                        type='number'
                        min={0}
                        placeholder='Để trống = không yêu cầu'
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Max Discount - chỉ hiện khi PERCENTAGE */}
            {voucherType === 'PERCENTAGE' && (
              <FormField
                control={form.control}
                name='maxDiscount'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='maxDiscount'>Giảm tối đa (₫)</Label>
                      <div className='col-span-3 space-y-1'>
                        <Input
                          id='maxDiscount'
                          type='number'
                          min={0}
                          placeholder='Để trống = không giới hạn'
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* Usage Limit */}
            <FormField
              control={form.control}
              name='usageLimit'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='usageLimit'>Giới hạn dùng</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input
                        id='usageLimit'
                        type='number'
                        min={1}
                        placeholder='Để trống = không giới hạn'
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* User Usage Limit */}
            <FormField
              control={form.control}
              name='userUsageLimit'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='userUsageLimit'>Mỗi user dùng tối đa</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input
                        id='userUsageLimit'
                        type='number'
                        min={1}
                        placeholder='VD: 1'
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name='startDate'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='startDate'>Ngày bắt đầu</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input
                        id='startDate'
                        type='datetime-local'
                        value={field.value ? field.value.slice(0, 16) : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name='endDate'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='endDate'>Ngày kết thúc</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input
                        id='endDate'
                        type='datetime-local'
                        value={field.value ? field.value.slice(0, 16) : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='isActive'>Kích hoạt</Label>
                    <Switch id='isActive' checked={field.value ?? true} onCheckedChange={field.onChange} />
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='edit-voucher-form' disabled={updateVoucherMutation.isPending}>
            {updateVoucherMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
