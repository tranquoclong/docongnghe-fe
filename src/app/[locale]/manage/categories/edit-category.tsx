'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { handleErrorApi } from '@/lib/utils'
import { UpdateCategoryBody, UpdateCategoryBodyType } from '@/schemaValidations/category.schema'
import { useGetCategoryQuery, useUpdateCategoryMutation } from '@/queries/useCategory'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { LoaderCircle } from 'lucide-react'

export default function EditCategory({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const updateCategoryMutation = useUpdateCategoryMutation()
  const { data } = useGetCategoryQuery({ enabled: Boolean(id), id: id as number })
  const form = useForm<UpdateCategoryBodyType>({
    resolver: zodResolver(UpdateCategoryBody) as any,
    defaultValues: {
      name: '',
      logo: '',
      parentCategoryId: undefined
    }
  })

  useEffect(() => {
    if (data) {
      const { name, logo, parentCategoryId } = data.payload
      form.reset({
        name,
        parentCategoryId: parentCategoryId ?? undefined,
        logo
      })
    }
  }, [data, form])
  const onSubmit = async (values: UpdateCategoryBodyType) => {
    if (updateCategoryMutation.isPending) return
    try {
      let body: UpdateCategoryBodyType & { id: number } = {
        id: id as number,
        ...values
      }
      await updateCategoryMutation.mutateAsync(body)
      await revalidateApiRequest('categories')
      toast({
        description: 'update category successfully!'
      })
      reset()
      onSubmitSuccess && onSubmitSuccess()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  const reset = () => {
    setId(undefined)
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Cập nhật danh mục</DialogTitle>
          <DialogDescription>Các trường sau đây là bắ buộc: Tên, ảnh</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-Category-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name'>Tên danh mục</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='name' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='logo'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='logo'>Icon danh mục</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='logo' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='edit-Category-form' disabled={updateCategoryMutation.isPending}>
            {updateCategoryMutation.isPending && <LoaderCircle className='w-5 h-5 mr-2 animate-spin' />} Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
