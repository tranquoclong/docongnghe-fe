'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { handleErrorApi } from '@/lib/utils'
import { useAddProductMutation } from '@/queries/useProduct'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import { useProductForm } from './use-product-form'
import { ProductDialog } from './product-dialog'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { CreateProductBodyType } from '@/schemaValidations/product.schema'

export default function AddProduct({
  categoryList,
  brandList
}: {
  categoryList: CategoryListResType['data']
  brandList: BrandListResType['data']
}) {
  const [open, setOpen] = useState(false)
  const addProductMutation = useAddProductMutation()

  const productForm = useProductForm({ categoryList, brandList })
  const { form, resetFormState } = productForm

  const reset = () => resetFormState()

  const onSubmit = async (values: CreateProductBodyType) => {
    if (addProductMutation.isPending) return
    try {
      console.log('values', { ...values, publishedAt: '2026-04-10T21:12:04.546Z' })
      await addProductMutation.mutateAsync({ ...values, publishedAt: '2026-04-10T21:12:04.546Z' })
      await revalidateApiRequest('products')
      toast({ description: 'Thêm sản phẩm thành công!' })
      reset()
      setOpen(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <>
      <Button size='sm' className='h-7 gap-1' onClick={() => setOpen(true)}>
        <PlusCircle className='h-3.5 w-3.5' />
        <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Thêm Sản phẩm</span>
      </Button>

      <ProductDialog
        open={open}
        onOpenChange={(value) => {
          if (!value) reset()
          setOpen(value)
        }}
        title='Thêm Sản phẩm'
        formId='add-product-form'
        onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}
        onReset={reset}
        submitLabel='Thêm sản phẩm'
        categoryList={categoryList}
        brandList={brandList}
        productMutation={addProductMutation}
        {...productForm}
      />
    </>
  )
}
