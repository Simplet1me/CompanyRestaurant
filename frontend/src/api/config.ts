import type { SystemConfig } from '@/types/config'
import { http } from '@/utils/request'

/** 查询系统参数（interfaces.md §8.1）权限：登录即可 */
export const getConfigs = () => http.get<SystemConfig>('/configs')

/** 修改系统参数（interfaces.md §8.2）权限：MANAGER */
export const updateConfigs = (data: SystemConfig) => http.put<SystemConfig>('/configs', data)
