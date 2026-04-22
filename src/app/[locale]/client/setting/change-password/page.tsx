'use client'

import { RectangleEllipsis, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { ChangePasswordBody, ChangePasswordBodyType } from '@/schemaValidations/account.schema'
import { handleErrorApi } from '@/lib/utils'
import { useChangePasswordMutation } from '@/queries/useAccount'
import { toast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations('Profile')
  const errorMessageT = useTranslations('ErrorMessage')
  const changePasswordMutation = useChangePasswordMutation()

  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      password: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })
  const onSubmit = async (data: ChangePasswordBodyType) => {
    if (changePasswordMutation.isPending) return
    try {
      const result = await changePasswordMutation.mutateAsync(data)
      toast({ description: 'Đổi mật khẩu thành công' })
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <div className=''>
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <h1 className='text-3xl font-bold'>Change Password</h1>
            </div>
            <p className='text-gray-400 mt-1'>Update your password at any time.</p>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='space-y-6 mt-6' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='password'
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <Label>
                  <RectangleEllipsis /> Current Password
                </Label>
                <Input type='password' {...field} />
                <FormMessage>{errors.password?.message && errorMessageT(errors.password.message as any)}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='newPassword'
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <Label>
                  <RectangleEllipsis /> New Password
                </Label>
                <Input type='password' {...field} />
                <FormMessage>
                  {errors.newPassword?.message && errorMessageT(errors.newPassword.message as any)}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmNewPassword'
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <Label>
                  <RectangleEllipsis /> Confirm New Password
                </Label>
                <Input type='password' {...field} />
                <FormMessage>
                  {errors.confirmNewPassword?.message && errorMessageT(errors.confirmNewPassword.message as any)}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
          >
            {changePasswordMutation.isPending && <LoaderCircle className='w-5 h-5 mr-2 animate-spin' />}
            {t('buttonUpdate')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
