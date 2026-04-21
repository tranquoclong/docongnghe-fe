'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { ColumnDef, flexRender } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import DOMPurify from 'dompurify'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createContext, useContext } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { formatCurrency, handleErrorApi } from '@/lib/utils'
import AutoPagination from '@/components/auto-pagination'
import { VoucherListResType } from '@/schemaValidations/voucher.schema'
import EditVoucher from '@/app/[locale]/manage/vouchers/edit-voucher'
import AddVoucher from '@/app/[locale]/manage/vouchers/add-voucher'
import { useDeleteVoucherMutation } from '@/queries/useVoucher'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { useVoucherTable } from '@/app/[locale]/manage/vouchers/use-voucher-table'
import VoucherCardMobile from '@/app/[locale]/manage/vouchers/voucher-card-mobile'
import { Badge } from '@/components/ui/badge'

type VoucherItem = VoucherListResType['data'][0]

const VoucherTableContext = createContext<{
  setVoucherIdEdit: (value: number) => void
  VoucherIdEdit: number | undefined
  VoucherDelete: VoucherItem | null
  setVoucherDelete: (value: VoucherItem | null) => void
}>({
  setVoucherIdEdit: (value: number | undefined) => {},
  VoucherIdEdit: undefined,
  VoucherDelete: null,
  setVoucherDelete: (value: VoucherItem | null) => {}
})

export const columns: ColumnDef<VoucherItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'code',
    header: 'Mã voucher',
    cell: ({ row }) => <span className='font-mono font-semibold text-blue-600'>{row.getValue('code')}</span>
  },
  {
    accessorKey: 'name',
    header: 'Tên',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  // {
  //   accessorKey: 'type',
  //   header: 'Loại',
  //   cell: ({ row }) => {
  //     const typeMap: Record<string, string> = {
  //       PERCENTAGE: 'Giảm %',
  //       FIXED_AMOUNT: 'Giảm tiền',
  //       FREE_SHIPPING: 'Miễn ship',
  //       BUY_X_GET_Y: 'Mua X tặng Y'
  //     }
  //     return <span>{typeMap[row.getValue('type')] ?? row.getValue('type')}</span>
  //   }
  // },
  {
    accessorKey: 'value',
    header: 'Giá trị',
    cell: ({ row }) => {
      const type: string = row.original.type
      const value: number = row.getValue('value')
      if (type === 'PERCENTAGE') return <span>{value}%</span>
      if (type === 'FREE_SHIPPING') return <span>Miễn phí</span>
      return <span>{value.toLocaleString('vi-VN')}₫</span>
    }
  },
  {
    accessorKey: 'minOrderValue',
    header: 'Đơn tối thiểu',
    cell: ({ row }) => {
      const value: number | null = row.getValue('minOrderValue')
      return value ? <span>{value.toLocaleString('vi-VN')}₫</span> : <span className='text-muted-foreground'>—</span>
    }
  },
  {
    accessorKey: 'usageLimit',
    header: 'Lượt dùng',
    cell: ({ row }) => {
      const used: number = row.original.usedCount
      const limit: number | null = row.getValue('usageLimit')
      return (
        <span>
          {used} / {limit ?? '∞'}
        </span>
      )
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Hiệu lực',
    cell: ({ row }) => {
      const start = new Date(row.original.startDate)
      const end = new Date(row.original.endDate)
      const fmt = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return (
        <div className='text-xs'>
          <div>{fmt(start)}</div>
          <div className='text-muted-foreground'>→ {fmt(end)}</div>
        </div>
      )
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const isActive: boolean = row.getValue('isActive')
      const now = new Date()
      const end = new Date(row.original.endDate)
      const expired = end < now

      if (expired) return <Badge variant='secondary'>Hết hạn</Badge>
      return isActive ? <Badge variant='default'>Đang hoạt động</Badge> : <Badge variant='outline'>Tắt</Badge>
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setVoucherIdEdit, setVoucherDelete } = useContext(VoucherTableContext)
      const openEditVoucher = () => setVoucherIdEdit(row.original.id)
      const openDeleteVoucher = () => setVoucherDelete(row.original)
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openEditVoucher}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteVoucher}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogDeleteVoucher({
  VoucherDelete,
  setVoucherDelete
}: {
  VoucherDelete: VoucherItem | null
  setVoucherDelete: (value: VoucherItem | null) => void
}) {
  const { mutateAsync } = useDeleteVoucherMutation()
  const deleteVoucher = async () => {
    if (VoucherDelete) {
      try {
        await mutateAsync(VoucherDelete.id)
        await revalidateApiRequest('vouchers')
        setVoucherDelete(null)
        toast({
          title: 'delete voucher successfully!'
        })
      } catch (error) {
        handleErrorApi({
          error
        })
      }
    }
  }
  return (
    <AlertDialog
      open={Boolean(VoucherDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setVoucherDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa voucher?</AlertDialogTitle>
          <AlertDialogDescription>
            Voucher <span className='bg-foreground text-primary-foreground rounded px-1'>{VoucherDelete?.name}</span> sẽ
            bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteVoucher}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default function VoucherTable() {
  const { table, data, VoucherIdEdit, setVoucherIdEdit, VoucherDelete, setVoucherDelete } = useVoucherTable(columns)

  return (
    <VoucherTableContext.Provider value={{ VoucherIdEdit, setVoucherIdEdit, VoucherDelete, setVoucherDelete }}>
      <div className='w-full'>
        <EditVoucher id={VoucherIdEdit} setId={setVoucherIdEdit} />
        <AlertDialogDeleteVoucher VoucherDelete={VoucherDelete} setVoucherDelete={setVoucherDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddVoucher />
          </div>
        </div>
        {/* Mobile card view */}
        <div className='md:hidden space-y-2'>
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <VoucherCardMobile
                  key={row.id}
                  voucher={row.original}
                  onEdit={() => setVoucherIdEdit(row.original.id)}
                  onDelete={() => setVoucherDelete(row.original)}
                />
              ))
          ) : (
            <p className='text-center text-muted-foreground py-8'>No results.</p>
          )}
        </div>
        {/* Desktop table view */}
        <div className='hidden md:block rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-xs text-muted-foreground py-4 flex-1 '>
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong <strong>{data.length}</strong>{' '}
            kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/vouchers'
            />
          </div>
        </div>
      </div>
    </VoucherTableContext.Provider>
  )
}
