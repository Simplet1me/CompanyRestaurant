import type { PageQuery } from './common'

/** 当前订餐状态（interfaces.md §6.1） */
export interface OrderStatus {
  canOrder: boolean
  /** 若可订，本次订单对应的用餐日期 */
  mealDate: string | null
  deadline: string
  serveStartTime: string
  /** 不可订时的原因提示 */
  reason: string | null
}

/** 订单明细（interfaces.md §6.2 items 元素） */
export interface OrderItem {
  id: number
  name: string
  unit: string
  price: number
  qty: number
  amount: number
}

/** 订单（interfaces.md §6.2） */
export interface Order {
  id: number
  mealDate: string
  status: 'VALID' | 'CANCELLED'
  empName: string
  phone: string
  workstation: string
  createTime: string
  totalPrice: number
  items: OrderItem[]
}

/** 下单请求（interfaces.md §6.2 请求体） */
export interface CreateOrderParams {
  items: { menuItemId: number; qty: number }[]
}

/** 总括订单（interfaces.md §6.7） */
export interface BlanketOrder {
  mealDate: string
  totalEmployeeCount: number
  items: { name: string; unit: string; totalQty: number }[]
}

/** 配餐批量查询（interfaces.md §6.8） */
export interface DeliveryOrder {
  mealDate: string
  orders: {
    id: number
    empName: string
    phone: string
    workstation: string
    items: { name: string; unit: string; qty: number }[]
  }[]
}

/** 订单分页查询参数（interfaces.md §6.3/§6.4） */
export interface OrderQuery extends PageQuery {
  /** 按用餐日期精确查询（可选） */
  mealDate?: string
}
