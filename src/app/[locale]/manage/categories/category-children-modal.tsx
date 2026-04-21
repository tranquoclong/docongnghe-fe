'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import { toast } from '@/components/ui/use-toast'
import { handleErrorApi } from '@/lib/utils'
import { useDeleteCategoryMutation } from '@/queries/useCategory'
import revalidateApiRequest from '@/apiRequests/revalidate'
import AddCategory from '@/app/[locale]/manage/categories/add-category'
import EditCategory from '@/app/[locale]/manage/categories/edit-category'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { useCategoryTable } from './use-category-table'
import { AlertDialogDeleteCategory } from './category-table'

type CategoryItem = CategoryListResType['data'][0]

const CategoryTableContext = createContext<{
  setCategoryIdEdit: (value: number) => void
  CategoryIdEdit: number | undefined
  CategoryDelete: CategoryItem | null
  setCategoryDelete: (value: CategoryItem | null) => void
}>({
  setCategoryIdEdit: (value: number | undefined) => {},
  CategoryIdEdit: undefined,
  CategoryDelete: null,
  setCategoryDelete: (value: CategoryItem | null) => {}
})

export const columns: ColumnDef<CategoryItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'logo',
    header: 'Ảnh',
    cell: ({ row }) => (
      <Avatar className='aspect-square w-[60px] h-[60px] rounded-md object-cover'>
        <AvatarImage src={row.getValue('logo')} />
        <AvatarFallback className='rounded-none'>{row.original.name}</AvatarFallback>
      </Avatar>
    )
  },
  {
    accessorKey: 'name',
    header: 'Tên',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setCategoryIdEdit, setCategoryDelete } = useContext(CategoryTableContext)
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
            <DropdownMenuItem onClick={() => setCategoryIdEdit(row.original.id)}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategoryDelete(row.original)}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

// function createColumns(
//   setChildIdEdit: (id: number) => void,
//   setChildDelete: (item: ChildCategory) => void
// ): ColumnDef<ChildCategory>[] {
//   return [
//     {
//       accessorKey: 'id',
//       header: 'ID'
//     },
//     {
//       accessorKey: 'logo',
//       header: 'Ảnh',
//       cell: ({ row }) => (
//         <Avatar className='aspect-square w-[60px] h-[60px] rounded-md object-cover'>
//           <AvatarImage src={row.getValue('logo')} />
//           <AvatarFallback className='rounded-none'>{row.original.name}</AvatarFallback>
//         </Avatar>
//       )
//     },
//     {
//       accessorKey: 'name',
//       header: 'Tên',
//       cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
//     },
//     {
//       id: 'actions',
//       enableHiding: false,
//       cell: ({ row }) => (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant='ghost' className='h-8 w-8 p-0'>
//               <span className='sr-only'>Open menu</span>
//               <DotsHorizontalIcon className='h-4 w-4' />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align='end'>
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem onClick={() => setChildIdEdit(row.original.id)}>Sửa</DropdownMenuItem>
//             <DropdownMenuItem onClick={() => setChildDelete(row.original)}>Xóa</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       )
//     }
//   ]
// }

interface CategoryChildrenModalProps {
  parent: CategoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CategoryChildrenModal({ parent, open, onOpenChange }: CategoryChildrenModalProps) {
  const data: CategoryItem[] = parent?.childrenCategories ?? []
  const { table, CategoryIdEdit, setCategoryIdEdit, CategoryDelete, setCategoryDelete } = useCategoryTable({
    data,
    columns,
    useUrlPagination: false
  })
  console.log('table', table)
  // const [childIdEdit, setChildIdEdit] = useState<number | undefined>(undefined)
  // const [childDelete, setChildDelete] = useState<ChildCategory | null>(null)
  // const [nameFilter, setNameFilter] = useState('')

  // const children: ChildCategory[] = parent?.childrenCategories ?? []

  // const columns = createColumns(setChildIdEdit, setChildDelete)

  // const filteredData = nameFilter
  //   ? children.filter((c) => c.name.toLowerCase().includes(nameFilter.toLowerCase()))
  //   : children

  // const table = useReactTable({
  //   data: filteredData,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  //   getPaginationRowModel: getPaginationRowModel(),
  //   getFilteredRowModel: getFilteredRowModel()
  // })

  return (
    <CategoryTableContext.Provider value={{ CategoryIdEdit, setCategoryIdEdit, CategoryDelete, setCategoryDelete }}>
      <EditCategory id={CategoryIdEdit} setId={setCategoryIdEdit} onSubmitSuccess={() => onOpenChange(false)} />
      <AlertDialogDeleteCategory
        CategoryDelete={CategoryDelete}
        setCategoryDelete={setCategoryDelete}
        onSubmitSuccess={() => onOpenChange(false)}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-3xl w-full '>
          <DialogHeader>
            <DialogTitle>
              Danh mục con của <span className='text-primary font-semibold'>{parent?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className='w-full'>
            <div className='flex items-center py-4'>
              <Input
                placeholder='Lọc tên'
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                className='max-w-sm'
              />
              <div className='ml-auto flex items-center gap-2'>
                <AddCategory parentCategoryId={parent?.id} onSubmitSuccess={() => onOpenChange(false)} />
              </div>
            </div>

            <div className='rounded-md border h-[60vh] overflow-auto'>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='h-24 text-center'>
                        Không có danh mục con.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-end py-4'>
              <span className='text-xs text-muted-foreground'>
                Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
                <strong>{data.length}</strong> kết quả
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CategoryTableContext.Provider>
  )
}
