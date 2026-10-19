import type { PageQuery, PageResult } from '@/types/common'
import type { CreateMenuParams, MenuDetail, MenuItem, MenuSummary } from '@/types/menu'
import { http } from '@/utils/request'


export const listMenus = (params: PageQuery) => http.get<PageResult<MenuSummary>>('/menus', params)


export const getCurrentMenu = () => http.get<MenuDetail | null>('/menus/current')


export const createMenu = (data: CreateMenuParams) => http.post<MenuDetail>('/menus', data)


export const getMenu = (id: number) => http.get<MenuDetail>(`/menus/${id}`)

export const renameMenu = (id: number, name: string) => http.put<null>(`/menus/${id}/name`, { name })


export const addMenuItems = (id: number, recipeIds: number[]) =>
  http.post<MenuDetail>(`/menus/${id}/items`, { recipeIds })


export const updateMenuItemPrice = (itemId: number, price: number) =>
  http.put<MenuItem>(`/menus/items/${itemId}/price`, { price })


export const deleteMenuItem = (itemId: number) => http.delete<null>(`/menus/items/${itemId}`)


export const deleteMenu = (id: number) => http.delete<null>(`/menus/${id}`)


export const activateMenu = (id: number) => http.put<MenuDetail>(`/menus/${id}/activate`)
