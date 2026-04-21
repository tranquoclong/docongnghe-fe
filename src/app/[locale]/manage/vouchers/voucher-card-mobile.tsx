'use client'

import { VoucherListResType } from '@/schemaValidations/voucher.schema'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

type VoucherItem = VoucherListResType['data'][0]

export default function VoucherCardMobile({
  voucher,
  onEdit,
  onDelete
}: {
  voucher: VoucherItem
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className='border rounded-lg p-3 flex gap-3'>
      {/* <Avatar className='w-[70px] h-[70px] rounded-md'>
        <AvatarImage src={voucher.image} className='object-cover' />
        <AvatarFallback className='rounded-none text-xs'>{voucher.name.slice(0, 2)}</AvatarFallback>
      </Avatar> */}
      <div className='flex-1 min-w-0 space-y-1'>
        <div className='flex items-start justify-between'>
          <p className='text-sm font-medium truncate'>{voucher.name}</p>
        </div>
        {/* <p className='text-sm font-semibold'>{formatCurrency(voucher.price)}</p> */}
        <div className='flex gap-1'>
          <Button variant='ghost' size='sm' className='h-6 text-xs px-2' onClick={onEdit}>
            <Pencil className='h-3 w-3 mr-1' /> Sửa
          </Button>
          <Button variant='ghost' size='sm' className='h-6 text-xs px-2 text-destructive' onClick={onDelete}>
            <Trash2 className='h-3 w-3 mr-1' /> Xóa
          </Button>
        </div>
      </div>
    </div>
  )
}
