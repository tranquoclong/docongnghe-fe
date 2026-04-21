import authApiRequest from '@/apiRequests/auth'
import { useMutation } from '@tanstack/react-query'

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login
  })
}

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.register
  })
}

export const useOtpMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.verifyOtp
  })
}

export const useLoginWithGoogleMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.loginWithGoogle
  })
}

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.logout
  })
}

export const useSetTokenToCookieMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.setTokenToCookie
  })
}
