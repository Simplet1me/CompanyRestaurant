import type { PageQuery, PageResult } from '@/types/common'
import type { CreateMenuParams, MenuDetail, MenuItem, MenuSummary } from '@/types/menu'
import { http } from '@/utils/request'

/** 菜单列表（含历史，interfaces.md §5.1）权限：登录即可 */
export const listMenus = (params: PageQuery) => http.get<PageResult<MenuSummary>>('/menus', params)

/** 当前使用中菜单（员工点餐用，interfaces.md §5.2）；无使用中菜单时 data 为 null */
export const getCurrentMenu = () => http.get<MenuDetail | null>('/menus/current')

/** 创建菜单（interfaces.md §5.3）权限：MANAGER */
export const createMenu = (data: CreateMenuParams) => http.post<MenuDetail>('/menus', data)

/** 菜单详情（interfaces.md §5.4）权限：登录即可 */
export const getMenu = (id: number) => http.get<MenuDetail>(`/menus/${id}`)

/** 向菜单添加菜品（interfaces.md §5.5）权限：MANAGER */
export const addMenuItems = (id: number, recipeIds: number[]) =>
  http.post<MenuDetail>(`/menus/${id}/items`, { recipeIds })

/** 修改菜单菜品价格（interfaces.md §5.6）权限：MANAGER */
export const updateMenuItemPrice = (itemId: number, price: number) =>
  http.put<MenuItem>(`/menus/items/${itemId}/price`, { price })

/** 删除菜单菜品（interfaces.md §5.7）权限：MANAGER */
export const deleteMenuItem = (itemId: number) => http.delete<null>(`/menus/items/${itemId}`)

/** 删除菜单（interfaces.md §5.8）权限：MANAGER */
export const deleteMenu = (id: number) => http.delete<null>(`/menus/${id}`)

/** 启用菜单（interfaces.md §5.9）权限：MANAGER */
export const activateMenu = (id: number) => http.put<MenuDetail>(`/menus/${id}/activate`)
