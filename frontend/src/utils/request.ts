import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/common'

/** 请求统一错误：msg 可直接展示给用户 */
export class ApiError extends Error {
  readonly code: number
  constructor(code: number, msg: string) {
    super(msg)
    this.name = 'ApiError'
    this.code = code
  }
}

const instance = axios.create({
  // 开发环境经 Vite 代理访问后端；直连/部署场景可用 VITE_API_BASE 环境变量覆盖
  baseURL: import.meta.env.VITE_API_BASE ?? '/api',
  timeout: 15000,
  // 会话基于 JSESSIONID Cookie（interfaces.md §0.3）
  withCredentials: true,
})

instance.interceptors.response.use(
  (response) => {
    // 文件下载（blob）等非 JSON 响应原样返回
    if (response.config.responseType === 'blob') return response
    // 后端业务错误统一为 HTTP 200 + body.code != 200（见后端 GlobalExceptionHandler）
    const body = response.data as ApiResponse<unknown>
    if (body.code !== 200) {
      return Promise.reject(new ApiError(body.code, body.msg || '请求失败'))
    }
    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    // 未登录：后端登录拦截器直接返回 HTTP 401；登录/注册/me 接口除外，其余跳登录页
    if (
      status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register') &&
      !url.includes('/auth/me')
    ) {
      window.location.href = '/login'
    }
    const msg =
      error.response?.data?.msg ?? (status === 401 ? '未登录或会话已过期' : '网络异常，请稍后重试')
    return Promise.reject(new ApiError(status ?? -1, msg))
  },
)

/** 统一解包：泛型 T 为响应 data 类型 */
async function unwrap<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const res = await promise
  return res.data.data
}

/**
 * 统一请求方法（泛型 T 为响应 data 类型）。
 * 文件上传（multipart）/下载（blob）等特殊场景请用 default 导出的 axios 实例。
 */
export const http = {
  get: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
    unwrap(instance.get<ApiResponse<T>>(url, { params, ...config })),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    unwrap(instance.post<ApiResponse<T>>(url, data, config)),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    unwrap(instance.put<ApiResponse<T>>(url, data, config)),
  /** DELETE 携带请求体的接口（如批量删除）传 config: { data: { ids } } */
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap(instance.delete<ApiResponse<T>>(url, config)),
}

/** 提取错误信息用于页面展示 */
export function errMessage(err: unknown, fallback = '操作失败，请稍后重试'): string {
  return err instanceof Error ? err.message : fallback
}

export default instance
