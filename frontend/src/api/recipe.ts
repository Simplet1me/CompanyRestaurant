import type { PageResult } from '@/types/common'
import type { BatchDeleteParams, Recipe, RecipeParams, RecipeQuery } from '@/types/recipe'
import { http } from '@/utils/request'

/** 食谱列表（分页，interfaces.md §4.1）权限：登录即可 */
export const listRecipes = (params: RecipeQuery) => http.get<PageResult<Recipe>>('/recipes', params)

/** 新增菜品（interfaces.md §4.2）权限：MANAGER、CHEF */
export const createRecipe = (data: RecipeParams) => http.post<Recipe>('/recipes', data)

/** 菜品详情（interfaces.md §4.3）权限：登录即可 */
export const getRecipe = (id: number) => http.get<Recipe>(`/recipes/${id}`)

/** 修改菜品（interfaces.md §4.4）权限：MANAGER、CHEF */
export const updateRecipe = (id: number, data: RecipeParams) => http.put<Recipe>(`/recipes/${id}`, data)

/** 删除菜品（interfaces.md §4.5）权限：MANAGER、CHEF */
export const deleteRecipe = (id: number) => http.delete<null>(`/recipes/${id}`)

/** 批量删除菜品（interfaces.md §4.6，DELETE 携带请求体）权限：MANAGER、CHEF */
export const batchDeleteRecipes = (data: BatchDeleteParams) => http.delete<null>('/recipes/batch', { data })
