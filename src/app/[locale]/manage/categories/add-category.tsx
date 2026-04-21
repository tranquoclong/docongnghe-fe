'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { handleErrorApi } from '@/lib/utils'
import { CreateCategoryBody, CreateCategoryBodyType } from '@/schemaValidations/category.schema'
import { useAddCategoryMutation } from '@/queries/useCategory'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'

export default function AddCategory({
  parentCategoryId = null,
  onSubmitSuccess
}: {
  parentCategoryId?: number | null
  onSubmitSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)
  const addCategoryMutation = useAddCategoryMutation()
  const form = useForm<CreateCategoryBodyType>({
    resolver: zodResolver(CreateCategoryBody) as any,
    defaultValues: {
      name: '',
      logo: '',
      parentCategoryId: undefined
    }
  })

  const reset = () => {
    form.reset()
  }
  const onSubmit = async (values: CreateCategoryBodyType) => {
    if (addCategoryMutation.isPending) return
    try {
      let body = { ...values, parentCategoryId }
      await addCategoryMutation.mutateAsync(body)
      await revalidateApiRequest('categories')
      toast({
        description: 'add category successfully!'
      })
      reset()
      setOpen(false)
      onSubmitSuccess && onSubmitSuccess()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }
  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
        setOpen(value)
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size='sm' className='h-7 gap-1'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Thêm danh mục</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Thêm danh mục</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='add-category-form'
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e)
            })}
            onReset={reset}
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
          <Button type='submit' form='add-category-form' disabled={addCategoryMutation.isPending}>
            {addCategoryMutation.isPending && <LoaderCircle className='w-5 h-5 mr-2 animate-spin' />} Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
