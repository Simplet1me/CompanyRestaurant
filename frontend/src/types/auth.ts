import type { User } from './common'

/** 登录请求（interfaces.md §1.1） */
export interface LoginParams {
  loginName: string
  password: string
  /** 记住我（选做，默认 false） */
  rememberMe?: boolean
}

/** 自助注册请求（interfaces.md §1.2）；角色固定 EMPLOYEE，密码 6~32 位 */
export interface RegisterParams {
  name: string
  loginName: string
  password: string
  phone: string
  /** 工作单位（可选） */
  department?: string
  workstation: string
}

/** 修改自己的密码（interfaces.md §1.5） */
export interface PasswordParams {
  oldPassword: string
  newPassword: string
}

/** 登录/注册响应 data 均为登录用户信息（interfaces.md §1.1/§1.2） */
export type LoginResult = User
