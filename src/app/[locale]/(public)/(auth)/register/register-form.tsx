'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { RegisterBodySchema, RegisterBodyType } from '@/schemaValidations/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOtpMutation, useRegisterMutation } from '@/queries/useAuth'
import { toast } from '@/components/ui/use-toast'
import { decodeToken, handleErrorApi } from '@/lib/utils'
import { useRouter } from '@/i18n/routing'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/components/app-provider'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import SearchParamsLoader, { useSearchParamsLoader } from '@/components/search-params-loader'
import { LoaderCircle } from 'lucide-react'
import { LoginWithGoogle } from '../login/login-form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

function OtpModal({
  open,
  email,
  onConfirm,
  onClose,
  isPending
}: {
  open: boolean
  email: string
  onConfirm: (code: string) => void
  onClose: () => void
  isPending: boolean
}) {
  const otpMutation = useOtpMutation()
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (!open) return
    setOtp(Array(6).fill(''))
    setCountdown(60)
    sendOtp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((p) => p - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const sendOtp = async () => {
    try {
      await otpMutation.mutateAsync({ email, type: 'REGISTER' })
      toast({ description: 'OTP đã gửi, check email nhé' })
    } catch {
      toast({ description: 'Gửi OTP thất bại' })
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || otpMutation.isPending) return
    setOtp(Array(6).fill(''))
    setCountdown(60)
    await sendOtp()
  }

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = char
    setOtp(next)
    if (char && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    pasted.split('').forEach((c, i) => {
      next[i] = c
    })
    setOtp(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const code = otp.join('')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Xác minh email</DialogTitle>
          <DialogDescription>
            Nhập mã 6 chữ số đã gửi đến <span className='font-medium text-foreground'>{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className='flex justify-center gap-2 my-2' onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <Input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              className='w-10 h-12 text-center text-lg font-semibold'
              inputMode='numeric'
              autoFocus={i === 0}
            />
          ))}
        </div>

        <p className='text-sm text-center text-muted-foreground'>
          {countdown > 0 ? (
            <>
              Gửi lại sau <span className='font-medium'>{countdown}s</span>
            </>
          ) : (
            <button
              type='button'
              onClick={handleResend}
              className='text-primary hover:underline'
              disabled={otpMutation.isPending}
            >
              Gửi lại mã
            </button>
          )}
        </p>

        <Button onClick={() => onConfirm(code)} disabled={code.length < 6 || isPending} className='w-full'>
          {isPending && <LoaderCircle className='w-4 h-4 mr-2 animate-spin' />}
          Xác nhận &amp; Đăng ký
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// --- Main Register Form ---
export default function RegisterForm() {
  const t = useTranslations('Register')
  const errorMessageT = useTranslations('ErrorMessage')
  const { searchParams, setSearchParams } = useSearchParamsLoader()
  const registerMutation = useRegisterMutation()
  const clearTokens = searchParams?.get('clearTokens')
  const setRole = useAppStore((state) => state.setRole)
  const router = useRouter()

  // Pending form data — set when user clicks "Đăng ký", cleared after OTP confirmed
  const [pendingData, setPendingData] = useState<RegisterBodyType | null>(null)

  const form = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBodySchema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      code: ''
    }
  })

  useEffect(() => {
    if (clearTokens) setRole()
  }, [clearTokens, setRole])

  // Step 1: validate form → open modal
  const onSubmit = (data: RegisterBodyType) => {
    setPendingData(data)
  }

  // Step 2: OTP confirmed → inject code and call API
  const handleOtpConfirm = async (code: string) => {
    if (!pendingData || registerMutation.isPending) return
    try {
      await registerMutation.mutateAsync({ ...pendingData, code })
      toast({ description: t('registerSuccess') })
      router.push('/login')
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError })
      setPendingData(null)
    }
  }

  return (
    <>
      <Card className='mx-auto max-w-sm'>
        <SearchParamsLoader onParamsReceived={setSearchParams} />
        <CardHeader>
          <CardTitle className='text-2xl'>{t('title')}</CardTitle>
          <CardDescription>{t('cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className='space-y-3 max-w-[600px] w-full' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <Label>Họ và tên</Label>
                    <Input {...field} />
                    <FormMessage>{errors.name?.message && errorMessageT(errors.name.message as any)}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <Input {...field} />
                    <FormMessage>{errors.email?.message && errorMessageT(errors.email.message as any)}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <Label>Số điện thoại</Label>
                    <Input {...field} />
                    <FormMessage>
                      {errors.phoneNumber?.message && errorMessageT(errors.phoneNumber.message as any)}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <Label>Mật khẩu</Label>
                    <Input type='password' {...field} />
                    <FormMessage>
                      {errors.password?.message && errorMessageT(errors.password.message as any)}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <Label>Xác nhận mật khẩu</Label>
                    <Input type='password' {...field} />
                    <FormMessage>
                      {errors.confirmPassword?.message && errorMessageT(errors.confirmPassword.message as any)}
                    </FormMessage>
                  </FormItem>
                )}
              />
              {/* code field is hidden — value injected programmatically from modal */}
              <Button type='submit' className='w-full'>
                {t('buttonRegister')}
              </Button>
              <LoginWithGoogle title={t('registerWithGoogle')} />
            </form>
            <div className='text-center text-sm mt-4'>
              chưa có tài khoản?
              <Link href='/login' className='text-blue-500 hover:text-blue-600 font-medium'>
                Đăng nhập
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>

      <OtpModal
        open={!!pendingData}
        email={pendingData?.email ?? ''}
        onConfirm={handleOtpConfirm}
        onClose={() => setPendingData(null)}
        isPending={registerMutation.isPending}
      />
    </>
  )
}
