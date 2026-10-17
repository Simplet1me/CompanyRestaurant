
export interface MonthlyReport {
  month: string
  items: {
    name: string
    unit: string
    totalQty: number
    avgPrice: number
    totalAmount: number
  }[]
  totalAmount: number
}


export interface ReportEmployee {
  id?: number
  name: string
  phone: string
  department?: string
  workstation?: string
}


export interface ReportOrder {
  id: number
  mealDate: string
  createTime: string
  totalPrice: number
  items: { name: string; unit: string; price: number; qty: number; amount: number }[]
}


export interface EmployeeMonthlyReport {
  month: string
  employee: ReportEmployee
  orders: ReportOrder[]
  monthTotalAmount: number
}


export interface PersonalMonthlyReport {
  month: string
  employee: ReportEmployee
  items: {
    name: string
    unit: string
    totalQty: number
    avgPrice: number
    totalAmount: number
  }[]
  totalAmount: number
}
