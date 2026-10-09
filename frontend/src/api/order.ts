import type { PageResult } from '@/types/common'
import type { BlanketOrder, CreateOrderParams, DeliveryOrder, Order, OrderQuery, OrderStatus } from '@/types/order'
import { http } from '@/utils/request'

/** 当前订餐状态（interfaces.md §6.1）权限：登录即可 */
export const getOrderStatus = () => http.get<OrderStatus>('/orders/status')

/** 下单（interfaces.md §6.2）权限：登录即可（任何角色） */
export const createOrder = (data: CreateOrderParams) => http.post<Order>('/orders', data)

/** 我的订单（interfaces.md §6.3）权限：登录即可 */
export const listMyOrders = (params: OrderQuery) => http.get<PageResult<Order>>('/orders/mine', params)

/** 订单查询（按用餐日期，interfaces.md §6.4）权限：MANAGER、DELIVERER */
export const listOrders = (params: OrderQuery) => http.get<PageResult<Order>>('/orders', params)

/** 订单详情（interfaces.md §6.5）权限：登录即可 */
export const getOrder = (id: number) => http.get<Order>(`/orders/${id}`)

/** 删除（取消）订单（interfaces.md §6.6）权限：MANAGER */
export const deleteOrder = (id: number) => http.delete<null>(`/orders/${id}`)

/** 总括订单（interfaces.md §6.7）权限：CHEF（MANAGER 也可） */
export const getBlanketOrder = (mealDate: string) => http.get<BlanketOrder>('/orders/blanket', { mealDate })

/** 配餐订单批量查询（interfaces.md §6.8）权限：DELIVERER（MANAGER 也可） */
export const getDeliveryOrders = (mealDate: string) => http.get<DeliveryOrder>('/orders/delivery', { mealDate })
