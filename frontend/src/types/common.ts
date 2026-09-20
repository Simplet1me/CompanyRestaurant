/** 统一响应体（interfaces.md §0.2） */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

/** 分页响应（interfaces.md §0.4） */
export interface PageResult<T> {
  total: number
  list: T[]
}

/** 分页请求参数（interfaces.md §0.4） */
export interface PageQuery {
  /** 页码，从 1 起，默认 1 */
  pageNum?: number
  /** 每页条数，默认 10，最大 100 */
  pageSize?: number
}

/** 角色枚举（interfaces.md §0.5）；任何角色均拥有点餐权限 */
export type Role = 'MANAGER' | 'CHEF' | 'DELIVERER' | 'FINANCE' | 'EMPLOYEE'

/** 登录用户（interfaces.md §1.1 响应 data） */
export interface User {
  id: number
  name: string
  loginName: string
  role: Role
  phone: string
  department?: string
  workstation?: string
}
