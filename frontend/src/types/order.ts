import type { PageQuery } from './common'


export interface OrderStatus {
  canOrder: boolean
  /** 若可订，本次订单对应的用餐日期 */
  mealDate: string | null
  deadline: string
  serveStartTime: string
  /** 不可订时的原因提示 */
  reason: string | null
}


export interface OrderItem {
  id: number
  name: string
  unit: string
  price: number
  qty: number
  amount: number
}


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


export interface CreateOrderParams {
  items: { menuItemId: number; qty: number }[]
}


export interface BlanketOrder {
  mealDate: string
  totalEmployeeCount: number
  items: { name: string; unit: string; totalQty: number }[]
}


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


export interface OrderQuery extends PageQuery {
  /** 按用餐日期精确查询（可选） */
  mealDate?: string
}
