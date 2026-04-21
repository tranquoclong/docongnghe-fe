'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { LoginBody, LoginBodyType } from '@/schemaValidations/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLoginMutation, useLoginWithGoogleMutation } from '@/queries/useAuth'
import { toast } from '@/components/ui/use-toast'
import { decodeToken, generateSocketInstance, handleErrorApi } from '@/lib/utils'
import { useRouter } from '@/i18n/routing'
import { useEffect } from 'react'
import { useAppStore } from '@/components/app-provider'
import envConfig from '@/config'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import SearchParamsLoader, { useSearchParamsLoader } from '@/components/search-params-loader'
import { LoaderCircle } from 'lucide-react'

export function LoginWithGoogle({ title }: { title: string }) {
  const googleLoginMutation = useLoginWithGoogleMutation()
  const handleLoginGoogle = async () => {
    if (googleLoginMutation.isPending) return

    try {
      const res = await googleLoginMutation.mutateAsync()
      const url = res.payload?.url
      if (!url) throw new Error('No redirect URL')
      window.location.href = url
    } catch (err) {
      console.error(err)
      toast({
        description: 'Login Google failed'
      })
    }
  }
  return (
    <Button type='button' onClick={handleLoginGoogle} disabled={googleLoginMutation.isPending} className='w-full'>
      <svg viewBox='0 0 24 24' className='w-5 h-5 mr-2'>
        <path
          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
          fill='#4285F4'
        />
        <path
          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          fill='#34A853'
        />
        <path
          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          fill='#FBBC05'
        />
        <path
          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          fill='#EA4335'
        />
        <path d='M1 1h22v22H1z' fill='none' />
      </svg>
      {title}
    </Button>
  )
}
export default function LoginForm() {
  const t = useTranslations('Login')
  const errorMessageT = useTranslations('ErrorMessage')
  const { searchParams, setSearchParams } = useSearchParamsLoader()
  const loginMutation = useLoginMutation()
  const clearTokens = searchParams?.get('clearTokens')
  // const setSocket = useAppStore((state) => state.setSocket)
  const setRole = useAppStore((state) => state.setRole)

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody) as any,
    defaultValues: {
      email: '',
      password: ''
    }
  })
  const router = useRouter()
  useEffect(() => {
    if (clearTokens) {
      setRole()
    }
  }, [clearTokens, setRole])
  const onSubmit = async (data: LoginBodyType) => {
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(data)
      toast({
        description: t('loginSuccess')
      })
      const role = decodeToken(result.payload.accessToken).roleName
      setRole(role)
      role === 'ADMIN' ? router.push('/manage/dashboard') : router.push('/')
      // setSocket(generateSocketInstance(result.payload.accessToken))
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Card className='mx-auto max-w-sm'>
      <SearchParamsLoader onParamsReceived={setSearchParams} />
      <CardHeader>
        <CardTitle className='text-2xl'>{t('title')}</CardTitle>
        <CardDescription>{t('cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='space-y-2 max-w-[600px] flex-shrink-0 w-full'
            noValidate
            onSubmit={form.handleSubmit(onSubmit, (err) => {
              if (process.env.NODE_ENV === 'development') {
                console.error('Form validation errors:', err)
              }
            })}
          >
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input id='email' type='email' placeholder='m@example.com' required {...field} />
                      <FormMessage>
                        {Boolean(errors.email?.message) && errorMessageT(errors.email?.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <div className='flex items-center'>
                        <Label htmlFor='password'>Password</Label>
                      </div>
                      <Input id='password' type='password' required {...field} />
                      <FormMessage>
                        {Boolean(errors.password?.message) && errorMessageT(errors.password?.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <Button type='submit' className='w-full'>
                {loginMutation.isPending && <LoaderCircle className='w-5 h-5 mr-2 animate-spin' />}
                {t('buttonLogin')}
              </Button>
              <LoginWithGoogle title={t('loginWithGoogle')} />
            </div>
          </form>
          <div className='text-center text-sm mt-4'>
            chưa có tài khoản?
            <Link href='/register' className='text-blue-500 hover:text-blue-600 font-medium'>
              Đăng ký
            </Link>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}
