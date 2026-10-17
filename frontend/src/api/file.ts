import instance, { http, ApiError } from '@/utils/request'

export interface ImportResult {
  successCount: number
  failureCount: number
  failures: { row: number; reason: string }[]
}

export async function uploadImage(file: File): Promise<string> {
  const data = new FormData()
  data.append('file', file)
  const result = await http.post<{ url: string }>('/files/upload/image', data, { timeout: 60000 })
  return result.url
}

export function importUsers(file: File) {
  const data = new FormData()
  data.append('file', file)
  return http.post<ImportResult>('/users/import', data, { timeout: 120000 })
}

/** 文件流和业务错误共用HTTP响应时，先识别JSON错误，避免下载出伪Excel文件。 */
export async function downloadExcel(path: string, filename: string, params?: object) {
  const response = await instance.get<Blob>(path, { params, responseType: 'blob', timeout: 60000 })
  if (response.data.type.includes('json')) {
    const error = JSON.parse(await response.data.text()) as { code: number; msg: string }
    throw new ApiError(error.code, error.msg || '下载失败')
  }
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
