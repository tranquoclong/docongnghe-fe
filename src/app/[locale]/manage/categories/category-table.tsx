'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { ColumnDef, flexRender } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
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
import { createContext, useContext, useState } from 'react'
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
import { handleErrorApi } from '@/lib/utils'
import AutoPagination from '@/components/auto-pagination'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import EditCategory from '@/app/[locale]/manage/categories/edit-category'
import AddCategory from '@/app/[locale]/manage/categories/add-category'
import { useCategoryListQuery, useDeleteCategoryMutation } from '@/queries/useCategory'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { useCategoryTable } from '@/app/[locale]/manage/categories/use-category-table'
import CategoryCardMobile from '@/app/[locale]/manage/categories/category-card-mobile'
import CategoryChildrenModal from '@/app/[locale]/manage/categories/category-children-modal'

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
      <div>
        <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
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
  {
    id: 'children_count',
    header: 'Danh mục con',
    cell: ({ row }) => {
      const count = row.original.childrenCategories?.length ?? 0
      return (
        <div className='flex items-center gap-1 text-muted-foreground text-sm'>
          {count > 0 ? (
            <>
              <span>{count} mục {'>'}</span>
            </>
          ) : (
            <span className='text-xs'>—</span>
          )}
        </div>
      )
    }
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

export function AlertDialogDeleteCategory({
  CategoryDelete,
  setCategoryDelete,
  onSubmitSuccess
}: {
  CategoryDelete: CategoryItem | null
  setCategoryDelete: (value: CategoryItem | null) => void
  onSubmitSuccess?: () => void
}) {
  const { mutateAsync } = useDeleteCategoryMutation()

  const deleteCategory = async () => {
    if (CategoryDelete) {
      try {
        await mutateAsync(CategoryDelete.id)
        await revalidateApiRequest('categories')
        setCategoryDelete(null)
        toast({ title: 'Xóa danh mục thành công!' })
        onSubmitSuccess && onSubmitSuccess()
      } catch (error) {
        handleErrorApi({ error })
      }
    }
  }

  return (
    <AlertDialog
      open={Boolean(CategoryDelete)}
      onOpenChange={(value) => {
        if (!value) setCategoryDelete(null)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
          <AlertDialogDescription>
            Danh mục <span className='bg-foreground text-primary-foreground rounded px-1'>{CategoryDelete?.name}</span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCategory}>Xác nhận</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function CategoryTable() {
  const CategoryListQuery = useCategoryListQuery()
  const data = CategoryListQuery.data?.payload.data ?? []
  const { table, CategoryIdEdit, setCategoryIdEdit, CategoryDelete, setCategoryDelete } = useCategoryTable({
    data,
    columns
  })

  const [selectedParent, setSelectedParent] = useState<CategoryItem | null>(null)
  const [childrenModalOpen, setChildrenModalOpen] = useState(false)

  const openChildrenModal = (category: CategoryItem) => {
    // Only open if this row is a parent (parentCategoryId is null) and has children
    if (category.parentCategoryId === null) {
      setSelectedParent(category)
      setChildrenModalOpen(true)
    }
  }

  return (
    <CategoryTableContext.Provider value={{ CategoryIdEdit, setCategoryIdEdit, CategoryDelete, setCategoryDelete }}>
      <div className='w-full'>
        <EditCategory id={CategoryIdEdit} setId={setCategoryIdEdit} />
        <AlertDialogDeleteCategory CategoryDelete={CategoryDelete} setCategoryDelete={setCategoryDelete} />

        <CategoryChildrenModal
          key={selectedParent?.id}
          parent={selectedParent}
          open={childrenModalOpen}
          onOpenChange={(open) => {
            setChildrenModalOpen(open)
            // if (!open) setSelectedParent(null)
          }}
        />

        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddCategory />
          </div>
        </div>
        <div className='md:hidden space-y-2'>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <CategoryCardMobile
                key={row.id}
                category={row.original}
                onEdit={() => setCategoryIdEdit(row.original.id)}
                onDelete={() => setCategoryDelete(row.original)}
                // onViewChildren={() => openChildrenModal(row.original)}
              />
            ))
          ) : (
            <p className='text-center text-muted-foreground py-8'>No results.</p>
          )}
        </div>

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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (target.closest('[data-radix-popper-content-wrapper]') || target.closest('button')) return
                      openChildrenModal(row.original)
                    }}
                    className={
                      row.original.parentCategoryId === null && (row.original.childrenCategories?.length ?? 0) > 0
                        ? 'cursor-pointer hover:bg-muted/60 transition-colors'
                        : ''
                    }
                  >
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
          <div className='text-xs text-muted-foreground py-4 flex-1'>
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong <strong>{data.length}</strong>{' '}
            kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/categories'
            />
          </div>
        </div>
      </div>
    </CategoryTableContext.Provider>
  )
}
