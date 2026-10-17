import type { User } from './common'


export interface LoginParams {
  loginName: string
  password: string
  /** 记住我（选做，默认 false） */
  rememberMe?: boolean
}


export interface RegisterParams {
  name: string
  loginName: string
  password: string
  phone: string
  /** 工作单位（可选） */
  department?: string
  workstation: string
}


export interface PasswordParams {
  oldPassword: string
  newPassword: string
}


export type LoginResult = User
