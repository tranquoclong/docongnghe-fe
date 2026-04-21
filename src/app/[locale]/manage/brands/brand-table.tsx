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
import { BrandListResType } from '@/schemaValidations/brand.schema'
import EditBrand from '@/app/[locale]/manage/brands/edit-brand'
import AddBrand from '@/app/[locale]/manage/brands/add-brand'
import { useDeleteBrandMutation } from '@/queries/useBrand'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { useBrandTable } from '@/app/[locale]/manage/brands/use-brand-table'
import BrandCardMobile from '@/app/[locale]/manage/brands/brand-card-mobile'

type BrandItem = BrandListResType['data'][0]

const BrandTableContext = createContext<{
  setBrandIdEdit: (value: number) => void
  BrandIdEdit: number | undefined
  BrandDelete: BrandItem | null
  setBrandDelete: (value: BrandItem | null) => void
}>({
  setBrandIdEdit: (value: number | undefined) => {},
  BrandIdEdit: undefined,
  BrandDelete: null,
  setBrandDelete: (value: BrandItem | null) => {}
})

export const columns: ColumnDef<BrandItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'logo',
    header: 'Ảnh',
    cell: ({ row }) => (
      <div>
        <Avatar className='aspect-square w-[100px] h-[30px] rounded-md object-cover'>
          <AvatarImage src={row.getValue('logo')} />
          <AvatarFallback className='rounded-none'>{row.original.name}</AvatarFallback>
        </Avatar>
      </div>
    )
  },
  {
    accessorKey: 'name',
    header: 'Tên',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  // {
  //   accessorKey: 'price',
  //   header: 'Giá cả',
  //   cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price'))}</div>
  // },
  // {
  //   accessorKey: 'description',
  //   header: 'Mô tả',
  //   cell: ({ row }) => (
  //     <div
  //       dangerouslySetInnerHTML={{
  //         __html: DOMPurify.sanitize(row.getValue('description'))
  //       }}
  //       className='whitespace-pre-line'
  //     />
  //   )
  // },
  // {
  //   accessorKey: 'status',
  //   header: 'Trạng thái',
  //   cell: ({ row }) => <div>{getVietnameseBrandStatus(row.getValue('status'))}</div>
  // },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setBrandIdEdit, setBrandDelete } = useContext(BrandTableContext)
      const openEditBrand = () => {
        setBrandIdEdit(row.original.id)
      }

      const openDeleteBrand = () => {
        setBrandDelete(row.original)
      }
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
            <DropdownMenuItem onClick={openEditBrand}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteBrand}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogDeleteBrand({
  BrandDelete,
  setBrandDelete
}: {
  BrandDelete: BrandItem | null
  setBrandDelete: (value: BrandItem | null) => void
}) {
  const { mutateAsync } = useDeleteBrandMutation()
  const deleteBrand = async () => {
    if (BrandDelete) {
      try {
        const result = await mutateAsync(BrandDelete.id)
        await revalidateApiRequest('brands')
        setBrandDelete(null)
        toast({
          title: 'delete brand successfully!'
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
      open={Boolean(BrandDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setBrandDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa thương hiệu?</AlertDialogTitle>
          <AlertDialogDescription>
            Thương hiệu <span className='bg-foreground text-primary-foreground rounded px-1'>{BrandDelete?.name}</span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteBrand}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default function BrandTable() {
  const { table, data, BrandIdEdit, setBrandIdEdit, BrandDelete, setBrandDelete } = useBrandTable(columns)

  return (
    <BrandTableContext.Provider value={{ BrandIdEdit, setBrandIdEdit, BrandDelete, setBrandDelete }}>
      <div className='w-full'>
        <EditBrand id={BrandIdEdit} setId={setBrandIdEdit} />
        <AlertDialogDeleteBrand BrandDelete={BrandDelete} setBrandDelete={setBrandDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddBrand />
          </div>
        </div>
        {/* Mobile card view */}
        <div className='md:hidden space-y-2'>
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <BrandCardMobile
                  key={row.id}
                  brand={row.original}
                  onEdit={() => setBrandIdEdit(row.original.id)}
                  onDelete={() => setBrandDelete(row.original)}
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
              pathname='/manage/brands'
            />
          </div>
        </div>
      </div>
    </BrandTableContext.Provider>
  )
}
