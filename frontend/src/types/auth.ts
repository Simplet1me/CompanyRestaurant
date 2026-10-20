import type { User } from './common'


export interface LoginParams {
  loginName: string
  password: string
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
