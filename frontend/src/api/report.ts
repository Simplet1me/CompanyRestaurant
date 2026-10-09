import type { EmployeeMonthlyReport, MonthlyReport, PersonalMonthlyReport } from '@/types/report'
import { http } from '@/utils/request'

/** 月度销售统计总报表（interfaces.md §7.1）权限：MANAGER、FINANCE */
export const getMonthlyReport = (month: string) => http.get<MonthlyReport>('/reports/monthly', { month })

/** 员工月度订单汇总表（interfaces.md §7.3）权限：MANAGER、FINANCE */
export const getEmployeeMonthlyReport = (userId: number, month: string) =>
  http.get<EmployeeMonthlyReport>(`/reports/employee/${userId}`, { month })

/** 个人月度消费统计汇总表（interfaces.md §7.5）权限：登录即可 */
export const getMyMonthlyReport = (month: string) => http.get<PersonalMonthlyReport>('/reports/mine/monthly', { month })

/** 个人月度订单汇总表（interfaces.md §7.7）权限：登录即可 */
export const getMyOrdersReport = (month: string) => http.get<EmployeeMonthlyReport>('/reports/mine/orders', { month })
