import type { LoginParams, PasswordParams, RegisterParams } from '@/types/auth'
import type { User } from '@/types/common'
import { http } from '@/utils/request'

/** 登录（interfaces.md §1.1）：成功后服务端建立会话（Set-Cookie: JSESSIONID） */
export const login = (data: LoginParams) => http.post<User>('/auth/login', data)

/** 自助注册（interfaces.md §1.2）：角色固定 EMPLOYEE，成功即建立会话 */
export const register = (data: RegisterParams) => http.post<User>('/auth/register', data)

/** 登出（interfaces.md §1.3） */
export const logout = () => http.post<null>('/auth/logout')

/** 当前登录用户（interfaces.md §1.4） */
export const me = () => http.get<User>('/auth/me')

/** 修改自己的密码（interfaces.md §1.5） */
export const changePassword = (data: PasswordParams) => http.put<null>('/auth/password', data)
