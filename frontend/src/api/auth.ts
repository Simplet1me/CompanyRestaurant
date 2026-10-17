import type { LoginParams, PasswordParams, RegisterParams } from '@/types/auth'
import type { User } from '@/types/common'
import { http } from '@/utils/request'


export const login = (data: LoginParams) => http.post<User>('/auth/login', data)


export const register = (data: RegisterParams) => http.post<User>('/auth/register', data)


export const logout = () => http.post<null>('/auth/logout')


export const me = () => http.get<User>('/auth/me')


export const changePassword = (data: PasswordParams) => http.put<null>('/auth/password', data)
