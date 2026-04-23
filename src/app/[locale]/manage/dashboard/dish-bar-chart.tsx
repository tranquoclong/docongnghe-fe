'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { DashboardIndicatorResType } from '@/schemaValidations/indicator.schema'
import { useMemo } from 'react'

const resolveCssVar = (variable: string) => {
  if (typeof window === 'undefined') return '#888'
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

const colors = [
  resolveCssVar('--chart-1'),
  resolveCssVar('--chart-2'),
  resolveCssVar('--chart-3'),
  resolveCssVar('--chart-4'),
  resolveCssVar('--chart-5')
]

const chartConfig = {
  successOrders: {
    label: 'Đơn thành công'
  },
  dish1: {
    label: 'Món 1',
    color: 'var(--chart-1)'
  },
  dish2: {
    label: 'Món 2',
    color: 'var(--chart-2)'
  },
  dish3: {
    label: 'Món 3',
    color: 'var(--chart-3)'
  },
  dish4: {
    label: 'Món 4',
    color: 'var(--chart-4)'
  },
  dish5: {
    label: 'Món 5',
    color: 'var(--chart-5)'
  }
} satisfies ChartConfig

export function DishBarChart({
  chartData
}: {
  chartData: Pick<DashboardIndicatorResType['data']['productIndicator'][0], 'name' | 'successOrders'>[]
}) {
  const chartDateColors = useMemo(
    () =>
      chartData.map((data, index) => {
        return {
          ...data,
          fill: colors[index] ?? colors[colors.length - 1]
        }
      }),
    [chartData]
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xếp hạng sản phẩm</CardTitle>
        <CardDescription>Được mua nhiều nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartDateColors}
            layout='vertical'
            margin={{
              left: 0
            }}
          >
            <YAxis
              dataKey='name'
              type='category'
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <XAxis dataKey='successOrders' type='number' hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey='successOrders' name={'Đơn thanh toán: '} radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
