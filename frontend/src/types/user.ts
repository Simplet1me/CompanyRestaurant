import type { PageQuery, Role } from './common'

/** 用户列表元素（interfaces.md §2.1） */
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

/** 新增用户（interfaces.md §2.2） */
export interface UserCreateParams {
  name: string
  loginName: string
  password: string
  phone: string
  department?: string
  workstation: string
  role: Role
}

/** 修改用户（interfaces.md §2.4，不含 password） */
export type UserUpdateParams = Omit<UserCreateParams, 'password'>

/** 重置用户密码（interfaces.md §2.6） */
export interface ResetPasswordParams {
  newPassword: string
}

/** 用户列表查询参数（interfaces.md §2.1） */
export interface UserQuery extends PageQuery {
  /** 姓名/登录名模糊搜索 */
  keyword?: string
  /** 按角色筛选 */
  role?: string
  /** 按部门模糊筛选 */
  department?: string
}
