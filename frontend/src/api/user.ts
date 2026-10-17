import type { PageResult } from '@/types/common'
import type { ResetPasswordParams, UserCreateParams, UserItem, UserQuery, UserUpdateParams } from '@/types/user'
import { http } from '@/utils/request'


export const listUsers = (params: UserQuery) => http.get<PageResult<UserItem>>('/users', params)


export const createUser = (data: UserCreateParams) => http.post<UserItem>('/users', data)


export const getUser = (id: number) => http.get<UserItem>(`/users/${id}`)


export const updateUser = (id: number, data: UserUpdateParams) => http.put<UserItem>(`/users/${id}`, data)


export const deleteUser = (id: number) => http.delete<null>(`/users/${id}`)


export const resetUserPassword = (id: number, data: ResetPasswordParams) =>
  http.put<null>(`/users/${id}/password`, data)
