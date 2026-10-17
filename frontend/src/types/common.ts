
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}


export interface PageResult<T> {
  total: number
  list: T[]
}


export interface PageQuery {
  /** 页码，从 1 起，默认 1 */
  pageNum?: number
  /** 每页条数，默认 10，最大 100 */
  pageSize?: number
}


export type Role = 'MANAGER' | 'CHEF' | 'DELIVERER' | 'FINANCE' | 'EMPLOYEE'


export interface User {
  id: number
  name: string
  loginName: string
  role: Role
  phone: string
  department?: string
  workstation?: string
}
