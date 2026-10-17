import type { PageQuery, Role } from './common'


export interface UserItem {
  id: number
  name: string
  loginName: string
  role: Role
  phone: string
  department?: string
  workstation: string
  createTime: string
}


export interface UserCreateParams {
  name: string
  loginName: string
  password: string
  phone: string
  department?: string
  workstation: string
  role: Role
}


export type UserUpdateParams = Omit<UserCreateParams, 'password'>


export interface ResetPasswordParams {
  newPassword: string
}


export interface UserQuery extends PageQuery {
  /** 姓名/登录名模糊搜索 */
  keyword?: string
  /** 按角色筛选 */
  role?: string
  /** 按部门模糊筛选 */
  department?: string
}
