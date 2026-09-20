import type { Role } from '@/types/common'

/** 角色中文名（interfaces.md §0.5） */
export const ROLE_LABELS: Record<Role, string> = {
  MANAGER: '餐厅经理',
  CHEF: '厨房主管',
  DELIVERER: '配餐员',
  FINANCE: '财务管理',
  EMPLOYEE: '企业员工',
}
