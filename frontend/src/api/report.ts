import type { EmployeeMonthlyReport, MonthlyReport, PersonalMonthlyReport } from '@/types/report'
import { http } from '@/utils/request'


export const getMonthlyReport = (month: string) => http.get<MonthlyReport>('/reports/monthly', { month })


export const getEmployeeMonthlyReport = (userId: number, month: string) =>
  http.get<EmployeeMonthlyReport>(`/reports/employee/${userId}`, { month })


export const getMyMonthlyReport = (month: string) => http.get<PersonalMonthlyReport>('/reports/mine/monthly', { month })


export const getMyOrdersReport = (month: string) => http.get<EmployeeMonthlyReport>('/reports/mine/orders', { month })
