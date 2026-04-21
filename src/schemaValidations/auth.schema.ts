import { Role } from '@/constants/type'
import z from 'zod'

export const LoginBody = z
  .object({
    email: z.string().min(1, { message: 'required' }).email({
      message: 'invalidEmail'
    }),
    password: z.string().min(6, 'minmaxPassword').max(100, 'minmaxPassword')
  })
  .strict()

export type LoginBodyType = z.TypeOf<typeof LoginBody>

export const RegisterBodySchema = z
  .object({
    name: z.string().min(1, { message: 'required' }),

    email: z
      .string()
      .min(1, { message: 'required' })
      .email({ message: 'invalidEmail' }),

    phoneNumber: z
      .string()
      .min(1, { message: 'required' })
      .regex(/^(0|\+84)[0-9]{9}$/, {
        message: 'invalidPhoneNumber'
      }),

    password: z
      .string()
      .min(6, 'minmaxPassword')
      .max(100, 'minmaxPassword'),

    confirmPassword: z
      .string()
      .min(1, { message: 'required' }),

    code: z
      .string()
    // .min(1, { message: 'required' })
    // .length(6, { message: 'invalidOtp' })
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'mismatchPassword',
    path: ['confirmPassword']
  })

export type RegisterBodyType = z.TypeOf<typeof RegisterBodySchema>

export const LoginRes = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type LoginResType = z.TypeOf<typeof LoginRes>

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>

export const RefreshTokenRes = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
})

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>

export const LogoutBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>

export const LoginGoogleQuery = z.object({
  code: z.string()
})

export type LoginGoogleQueryType = z.TypeOf<typeof LoginGoogleQuery>

export type GoogleLoginResType = {
  url: string
}
