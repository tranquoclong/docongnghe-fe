'use client'

import { ColumnDef, flexRender } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createContext, useContext } from 'react'
import { formatCurrency, getVietnameseOrderStatus, handleErrorApi } from '@/lib/utils'
import AutoPagination from '@/components/auto-pagination'
import { OrderListResType } from '@/schemaValidations/order.schema'
import AddOrder from '@/app/[locale]/manage/orders/add-order'
import { toast } from '@/components/ui/use-toast'
import { useOrderTable } from '@/app/[locale]/manage/orders/use-order-table'
import OrderCardMobile from '@/app/[locale]/manage/orders/order-card-mobile'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'

type OrderItem = OrderListResType['data'][0]

export const OrderTableContext = createContext({
  changeStatus: (payload: { id: number; userId: number; status: (typeof OrderStatusValues)[number] }) => {}
})

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING_PAYMENT: 'outline',
  PENDING_PICKUP: 'secondary',
  PENDING_DELIVERY: 'secondary',
  DELIVERED: 'default',
  RETURNED: 'destructive',
  CANCELLED: 'destructive'
}

export const columns: ColumnDef<OrderItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span className='font-mono text-xs'>#{row.getValue('id')}</span>
  },

  // Người nhận
  {
    id: 'receiver',
    header: 'Người nhận',
    cell: ({ row }) => {
      const receiver = row.original.receiver
      return (
        <div className='min-w-[140px]'>
          <p className='font-medium text-sm'>{receiver.name}</p>
          <p className='text-xs text-muted-foreground'>{receiver.phone}</p>
          <p className='text-xs text-muted-foreground truncate max-w-[180px]' title={receiver.address}>
            {receiver.address}
          </p>
        </div>
      )
    }
  },

  // Sản phẩm
  {
    id: 'items',
    header: 'Sản phẩm',
    cell: ({ row }) => {
      const items = row.original.items
      return (
        <div className='min-w-[160px] space-y-1'>
          {items.slice(0, 2).map((item) => (
            <div key={item.id} className='flex items-center gap-2'>
              <img src={item.image} alt={item.productName} className='w-8 h-8 rounded object-cover shrink-0' />
              <div className='overflow-hidden'>
                <p className='text-xs font-medium truncate max-w-[120px]' title={item.productName}>
                  {item.productName}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {item.skuValue} &times; {item.quantity}
                </p>
              </div>
            </div>
          ))}
          {items.length > 2 && <p className='text-xs text-muted-foreground'>+{items.length - 2} sản phẩm khác</p>}
        </div>
      )
    }
  },

  // Tổng tiền
  {
    accessorKey: 'totalAmount',
    header: 'Tổng tiền',
    cell: ({ row }) => {
      const discount = row.original.discountAmount ?? 0
      const total = row.getValue<number>('totalAmount')
      return (
        <div className='min-w-[110px]'>
          <p className='font-semibold text-sm'>{formatCurrency(total)}</p>
          {discount > 0 && <p className='text-xs text-green-600'>-{formatCurrency(discount)}</p>}
        </div>
      )
    }
  },

  // Trạng thái
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: function Cell({ row }) {
      const { changeStatus } = useContext(OrderTableContext)
      return (
        <Select
          onValueChange={(value: (typeof OrderStatusValues)[number]) => {
            changeStatus({ id: row.original.id, userId: row.original.userId, status: value })
          }}
          value={row.getValue('status')}
        >
          <SelectTrigger className='w-[160px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OrderStatusValues.map((status) => (
              <SelectItem key={status} value={status}>
                {getVietnameseOrderStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
  },

  // Ngày tạo
  {
    id: 'createdAt',
    header: 'Ngày đặt',
    cell: ({ row }) => {
      const date = row.original.items[0]?.createdAt
      if (!date) return null
      return (
        <div className='text-xs text-muted-foreground whitespace-nowrap'>
          {new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    }
  },

  // Actions
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const order = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <DotsHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(order.id))}>
              Copy mã đơn
            </DropdownMenuItem>
            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export default function OrderTable() {
  const { table, data, changeStatus } = useOrderTable(columns)

  return (
    <OrderTableContext.Provider value={{ changeStatus }}>
      <div className='w-full'>
        <div className='flex items-center py-4 gap-2 flex-wrap'>
          <Input
            placeholder='Lọc tên người nhận...'
            // value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            // onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddOrder />
          </div>
        </div>

        {/* Mobile */}
        <div className='md:hidden space-y-2'>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => <OrderCardMobile key={row.id} order={row.original} />)
          ) : (
            <p className='text-center text-muted-foreground py-8'>Không có kết quả.</p>
          )}
        </div>

        {/* Desktop */}
        <div className='hidden md:block rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
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
                    Không có kết quả.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-xs text-muted-foreground py-4 flex-1'>
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong <strong>{data.length}</strong>{' '}
            kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/orders'
            />
          </div>
        </div>
      </div>
    </OrderTableContext.Provider>
  )
}
