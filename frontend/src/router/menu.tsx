import {
  Assessment,
  BarChart,
  Group,
  ListAlt,
  LocalShipping,
  MenuBook,
  ReceiptLong,
  Restaurant,
  RestaurantMenu,
  Settings,
  SoupKitchen,
} from '@mui/icons-material'
import type { ReactElement } from 'react'
import type { Role } from '@/types/common'

export interface NavItem {
  label: string
  path: string
  icon: ReactElement
  /** 可访问角色；缺省表示所有角色可见（任何角色均拥有点餐权限） */
  roles?: Role[]
}

/** 侧边导航配置（权限矩阵见 ../docs/requirements.md §2） */
export const NAV_ITEMS: NavItem[] = [
  { label: '点餐', path: '/', icon: <RestaurantMenu /> },
  { label: '我的订单', path: '/my/orders', icon: <ReceiptLong /> },
  { label: '我的统计', path: '/my/reports', icon: <Assessment /> },
  { label: '用户管理', path: '/users', icon: <Group />, roles: ['MANAGER'] },
  { label: '食谱管理', path: '/recipes', icon: <MenuBook />, roles: ['MANAGER', 'CHEF'] },
  { label: '菜单管理', path: '/menus', icon: <Restaurant />, roles: ['MANAGER'] },
  { label: '订单管理', path: '/orders', icon: <ListAlt />, roles: ['MANAGER', 'DELIVERER'] },
  { label: '总括订单', path: '/orders/blanket', icon: <SoupKitchen />, roles: ['CHEF', 'MANAGER'] },
  { label: '配餐打印', path: '/orders/delivery', icon: <LocalShipping />, roles: ['DELIVERER', 'MANAGER'] },
  { label: '统计报表', path: '/reports', icon: <BarChart />, roles: ['MANAGER', 'FINANCE'] },
  { label: '系统配置', path: '/configs', icon: <Settings />, roles: ['MANAGER'] },
]
