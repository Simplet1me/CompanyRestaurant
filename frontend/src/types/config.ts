/** 系统参数（interfaces.md §8.1） */
export interface SystemConfig {
  /** 订餐截止时间（HH:mm） */
  orderDeadline: string
  /** 配餐开始时间（HH:mm，须晚于订餐截止时间） */
  serveStartTime: string
}
