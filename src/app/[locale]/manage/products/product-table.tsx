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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { ProductListResType } from '@/schemaValidations/product.schema'
import EditProduct from '@/app/[locale]/manage/products/edit-product'
import AddProduct from '@/app/[locale]/manage/products/add-product'
import { useDeleteProductMutation } from '@/queries/useProduct'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { useProductTable } from '@/app/[locale]/manage/products/use-product-table'
import ProductCardMobile from '@/app/[locale]/manage/products/product-card-mobile'
import { useCategoryListQuery } from '@/queries/useCategory'
import { useBrandListQuery } from '@/queries/useBrand'

type ProductItem = ProductListResType['data'][0]

const ProductTableContext = createContext<{
  setProductIdEdit: (value: number) => void
  productIdEdit: number | undefined
  productDelete: ProductItem | null
  setProductDelete: (value: ProductItem | null) => void
}>({
  setProductIdEdit: (value: number | undefined) => {},
  productIdEdit: undefined,
  productDelete: null,
  setProductDelete: (value: ProductItem | null) => {}
})

export const columns: ColumnDef<ProductItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'images',
    header: 'Ảnh',
    cell: ({ row }) => (
      <div>
        <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
          <AvatarImage src={(row.getValue('images') as string[])[0]} />
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
  {
    accessorKey: 'basePrice',
    header: 'Giá cơ bản',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('basePrice'))}</div>
  },
  {
    accessorKey: 'virtualPrice',
    header: 'Giá ảo',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('virtualPrice'))}</div>
  },
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
  //   cell: ({ row }) => <div>{getVietnameseProductStatus(row.getValue('status'))}</div>
  // },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setProductIdEdit, setProductDelete } = useContext(ProductTableContext)
      const openEditProduct = () => {
        setProductIdEdit(row.original.id)
      }

      const openDeleteProduct = () => {
        setProductDelete(row.original)
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
            <DropdownMenuItem onClick={openEditProduct}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteProduct}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogDeleteProduct({
  productDelete,
  setProductDelete
}: {
  productDelete: ProductItem | null
  setProductDelete: (value: ProductItem | null) => void
}) {
  const { mutateAsync } = useDeleteProductMutation()
  const deleteProduct = async () => {
    if (productDelete) {
      try {
        const result = await mutateAsync(productDelete.id)
        await revalidateApiRequest('products')
        setProductDelete(null)
        toast({
          title: 'delete product successfully!'
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
      open={Boolean(productDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setProductDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Món <span className='bg-foreground text-primary-foreground rounded px-1'>{productDelete?.name}</span> sẽ bị xóa
            vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteProduct}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default function ProductTable() {
  const { table, data, productIdEdit, setProductIdEdit, productDelete, setProductDelete } = useProductTable(columns)
  const categoryListQuery = useCategoryListQuery()
  const brandListQuery = useBrandListQuery()
  const categoryList = categoryListQuery.data?.payload.data ?? []
  const brandList = brandListQuery.data?.payload.data ?? []

  return (
    <ProductTableContext.Provider value={{ productIdEdit, setProductIdEdit, productDelete, setProductDelete }}>
      <div className='w-full'>
        <EditProduct id={productIdEdit} setId={setProductIdEdit} categoryList={categoryList} brandList={brandList} />
        <AlertDialogDeleteProduct productDelete={productDelete} setProductDelete={setProductDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddProduct categoryList={categoryList} brandList={brandList} />
          </div>
        </div>
        {/* Mobile card view */}
        <div className='md:hidden space-y-2'>
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <ProductCardMobile
                  key={row.id}
                  product={row.original}
                  onEdit={() => setProductIdEdit(row.original.id)}
                  onDelete={() => setProductDelete(row.original)}
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
              pathname='/manage/products'
            />
          </div>
        </div>
      </div>
    </ProductTableContext.Provider>
  )
}
