import type { PageResult } from '@/types/common'
import type { ResetPasswordParams, UserCreateParams, UserItem, UserQuery, UserUpdateParams } from '@/types/user'
import { http } from '@/utils/request'

/** 用户列表（分页，interfaces.md §2.1）权限：MANAGER */
export const listUsers = (params: UserQuery) => http.get<PageResult<UserItem>>('/users', params)

/** 新增用户（interfaces.md §2.2）权限：MANAGER */
export const createUser = (data: UserCreateParams) => http.post<UserItem>('/users', data)

/** 用户详情（interfaces.md §2.3）权限：MANAGER */
export const getUser = (id: number) => http.get<UserItem>(`/users/${id}`)

/** 修改用户（interfaces.md §2.4）权限：MANAGER */
export const updateUser = (id: number, data: UserUpdateParams) => http.put<UserItem>(`/users/${id}`, data)

/** 删除用户（interfaces.md §2.5）权限：MANAGER */
export const deleteUser = (id: number) => http.delete<null>(`/users/${id}`)

/** 重置用户密码（interfaces.md §2.6）权限：MANAGER */
export const resetUserPassword = (id: number, data: ResetPasswordParams) =>
  http.put<null>(`/users/${id}/password`, data)
