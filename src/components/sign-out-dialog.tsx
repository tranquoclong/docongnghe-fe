'use client'

import { useRouter } from '@/i18n/routing'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLogoutMutation } from '@/queries/useAuth'
import { handleErrorApi } from '@/lib/utils'
import { useAppStore } from '@/components/app-provider'
import { useTranslations } from 'next-intl'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const t = useTranslations('NavItem')
  const router = useRouter()
  const logoutMutation = useLogoutMutation()
  const setRole = useAppStore((state) => state.setRole)
  // const disconnectSocket = useAppStore((state) => state.disconnectSocket)
  const handleSignOut = async () => {
    if (logoutMutation.isPending) return
    try {
      await logoutMutation.mutateAsync()
      setRole()
      // disconnectSocket()
      router.push('/')
    } catch (error: any) {
      handleErrorApi({
        error
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('logoutDialog.logoutQuestion')}
      desc={t('logoutDialog.logoutConfirm')}
      confirmText={t('logoutDialog.logoutOk')}
      cancelBtnText={t('logoutDialog.logoutCancel')}
      destructive
      isLoading={logoutMutation.isPending}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
