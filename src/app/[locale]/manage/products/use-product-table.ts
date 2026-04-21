'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductListResType } from '@/schemaValidations/product.schema'
import { useProductListQuery } from '@/queries/useProduct'

type ProductItem = ProductListResType['data'][0]

const PAGE_SIZE = 10

export function useProductTable(columns: ColumnDef<ProductItem>[]) {
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const [productIdEdit, setProductIdEdit] = useState<number | undefined>()
  const [productDelete, setProductDelete] = useState<ProductItem | null>(null)
  const productListQuery = useProductListQuery()
  const data = productListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination }
  })

  useEffect(() => {
    table.setPagination({ pageIndex, pageSize: PAGE_SIZE })
  }, [table, pageIndex])

  return {
    table, data, productIdEdit, setProductIdEdit, productDelete, setProductDelete
  }
}

