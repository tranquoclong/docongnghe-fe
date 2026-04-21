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
import { OrderListResType } from '@/schemaValidations/order.schema'
import { useChangeStatusOrderMutation, useManageOrderListQuery } from '@/queries/useOrder'
import { OrderStatusValues } from '@/constants/type'
import { handleErrorApi } from '@/lib/utils'

type OrderItem = OrderListResType['data'][0]

const PAGE_SIZE = 10

export function useOrderTable(columns: ColumnDef<OrderItem>[]) {
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const changeStatusOrderMutation = useChangeStatusOrderMutation()
  const OrderListQuery = useManageOrderListQuery()
  const data = OrderListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE
  })
  const changeStatus = async (body: {
    id: number
    userId: number
    status: (typeof OrderStatusValues)[number]
  }) => {
    try {
      await changeStatusOrderMutation.mutateAsync(body)
    } catch (error) {
      handleErrorApi({ error })
    }
  }
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
    table, data, changeStatus
  }
}

