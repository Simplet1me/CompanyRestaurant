import type { SystemConfig } from '@/types/config'
import { http } from '@/utils/request'


export const getConfigs = () => http.get<SystemConfig>('/configs')


export const updateConfigs = (data: SystemConfig) => http.put<SystemConfig>('/configs', data)
