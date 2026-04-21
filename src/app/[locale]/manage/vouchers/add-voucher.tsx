'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { handleErrorApi } from '@/lib/utils'
import { CreateVoucherBody, CreateVoucherBodyType } from '@/schemaValidations/voucher.schema'
import { useAddVoucherMutation } from '@/queries/useVoucher'
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

const defaultValues: CreateVoucherBodyType = {
  code: '',
  name: '',
  description: '',
  type: 'PERCENTAGE',
  value: 0,
  minOrderValue: undefined,
  maxDiscount: undefined,
  usageLimit: undefined,
  userUsageLimit: 1,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  isActive: true,
  applicableProducts: [],
  excludedProducts: []
}

export default function AddVoucher() {
  const [open, setOpen] = useState(false)
  const addVoucherMutation = useAddVoucherMutation()
  const form = useForm<CreateVoucherBodyType>({
    resolver: zodResolver(CreateVoucherBody) as any,
    defaultValues
  })

  const voucherType = form.watch('type')

  const reset = () => form.reset(defaultValues)

  const onSubmit = async (values: CreateVoucherBodyType) => {
    if (addVoucherMutation.isPending) return
    try {
      await addVoucherMutation.mutateAsync(values)
      await revalidateApiRequest('vouchers')
      toast({ description: 'Thêm voucher thành công!' })
      reset()
      setOpen(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) reset()
        setOpen(value)
      }}
    >
      <DialogTrigger asChild>
        <Button size='sm' className='h-7 gap-1'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Thêm voucher</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Thêm voucher</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid gap-4 py-4'
            id='add-voucher-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            {/* Code */}
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='code'>Mã voucher</Label>
                    <div className='col-span-3 space-y-1'>
                      <Input
                        id='code'
                        placeholder='VD: SALE20, FREESHIP100'
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

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
                        placeholder={voucherType === 'PERCENTAGE' ? 'VD: 20' : 'VD: 50000'}
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
                        placeholder='VD: 300000'
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Max Discount */}
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
                          placeholder='VD: 100000'
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
                    <Switch id='isActive' checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='add-voucher-form' disabled={addVoucherMutation.isPending}>
            {addVoucherMutation.isPending ? 'Đang thêm...' : 'Thêm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
