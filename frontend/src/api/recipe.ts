import type { PageResult } from '@/types/common'
import type { BatchDeleteParams, Recipe, RecipeParams, RecipeQuery } from '@/types/recipe'
import { http } from '@/utils/request'


export const listRecipes = (params: RecipeQuery) => http.get<PageResult<Recipe>>('/recipes', params)


export const createRecipe = (data: RecipeParams) => http.post<Recipe>('/recipes', data)


export const getRecipe = (id: number) => http.get<Recipe>(`/recipes/${id}`)


export const updateRecipe = (id: number, data: RecipeParams) => http.put<Recipe>(`/recipes/${id}`, data)


export const deleteRecipe = (id: number) => http.delete<null>(`/recipes/${id}`)


export const batchDeleteRecipes = (data: BatchDeleteParams) => http.delete<null>('/recipes/batch', { data })
