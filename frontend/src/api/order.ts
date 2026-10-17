import type { PageResult } from '@/types/common'
import type { BlanketOrder, CreateOrderParams, DeliveryOrder, Order, OrderQuery, OrderStatus } from '@/types/order'
import { http } from '@/utils/request'


export const getOrderStatus = () => http.get<OrderStatus>('/orders/status')


export const createOrder = (data: CreateOrderParams) => http.post<Order>('/orders', data)


export const listMyOrders = (params: OrderQuery) => http.get<PageResult<Order>>('/orders/mine', params)


export const listOrders = (params: OrderQuery) => http.get<PageResult<Order>>('/orders', params)


export const getOrder = (id: number) => http.get<Order>(`/orders/${id}`)


export const deleteOrder = (id: number) => http.delete<null>(`/orders/${id}`)


export const getBlanketOrder = (mealDate: string) => http.get<BlanketOrder>('/orders/blanket', { mealDate })


export const getDeliveryOrders = (mealDate: string) => http.get<DeliveryOrder>('/orders/delivery', { mealDate })
