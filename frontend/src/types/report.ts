/** 月度销售统计（interfaces.md §7.1） */
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

/** 报表中的员工信息（interfaces.md §7.3/§7.5 employee） */
export interface ReportEmployee {
  id?: number
  name: string
  phone: string
  department?: string
  workstation?: string
}

/** 报表中的订单（interfaces.md §7.3 orders 元素） */
export interface ReportOrder {
  id: number
  mealDate: string
  createTime: string
  totalPrice: number
  items: { name: string; unit: string; price: number; qty: number; amount: number }[]
}

/** 员工月度订单汇总表（interfaces.md §7.3，个人版 §7.7 结构同） */
export interface EmployeeMonthlyReport {
  month: string
  employee: ReportEmployee
  orders: ReportOrder[]
  monthTotalAmount: number
}

/** 个人月度消费统计汇总表（interfaces.md §7.5） */
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
