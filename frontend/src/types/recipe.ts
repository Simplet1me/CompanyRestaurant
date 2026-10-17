import type { PageQuery } from './common'


export interface Recipe {
  id: number
  name: string
  photo?: string
  unit: string
  classify: string
  price: number
  createTime: string
  updateTime: string
}


export interface RecipeParams {
  name: string
  /** 菜品图片地址（选填） */
  photo?: string
  unit: string
  classify: string
  price: number
}


export interface BatchDeleteParams {
  ids: number[]
}


export interface RecipeQuery extends PageQuery {
  /** 菜名模糊搜索 */
  keyword?: string
  /** 按分类精确筛选 */
  classify?: string
}
