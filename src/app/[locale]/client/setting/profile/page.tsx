'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { handleErrorApi } from '@/lib/utils'

import { User, Phone, Link } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

import { useAccountMe, useUpdateMeMutation } from '@/queries/useAccount'
import { UpdateMeBody, UpdateMeBodyType } from '@/schemaValidations/account.schema'

export default function Page() {
  const accountMe = useAccountMe(true)
  const updateProfileMutation = useUpdateMeMutation()

  const account = accountMe.data?.payload

  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      phoneNumber: '',
      avatar: ''
    }
  })

  useEffect(() => {
    if (!account) return

    form.reset({
      name: account.name || '',
      phoneNumber: account.phoneNumber || '',
      avatar: account.avatar || ''
    })
  }, [form, account])

  const onSubmit = async (data: UpdateMeBodyType) => {
    if (updateProfileMutation.isPending) return

    try {
      await updateProfileMutation.mutateAsync(data)

      toast({
        description: 'Cập nhật thành công'
      })
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <div>
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <h1 className='text-3xl font-bold'>Personal Information</h1>
            </div>
            <p className='text-gray-400 mt-1'>This information will be displayed publicly on your profile.</p>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='space-y-8 mt-6' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='name'
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <Label className='flex items-center gap-2'>
                    <User /> Name
                  </Label>
                  <Input {...field} placeholder='Your name' />
                  <FormMessage>{errors.name?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phoneNumber'
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <Label className='flex items-center gap-2'>
                    <Phone /> Phone Number
                  </Label>
                  <Input {...field} placeholder='Your phone number' />
                  <FormMessage>{errors.phoneNumber?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='avatar'
              render={({ field, formState: { errors } }) => (
                <FormItem className='sm:col-span-2'>
                  <Label className='flex items-center gap-2'>
                    <Link /> Avatar URL
                  </Label>
                  <Input {...field} placeholder='https://...' />
                  <FormMessage>{errors.avatar?.message}</FormMessage>

                  {field.value && <img src={field.value} className='w-20 h-20 rounded-full mt-2 object-cover' />}
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-end space-x-4'>
            <Button type='button' variant='outline' onClick={() => form.reset()}>
              Cancel
            </Button>

            <Button type='submit' disabled={updateProfileMutation.isPending || !form.formState.isDirty}>
              {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
