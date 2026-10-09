import type { PageQuery } from './common'

/** 食谱菜品（interfaces.md §4.1） */
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

/** 新增/修改菜品（interfaces.md §4.2/§4.4） */
export interface RecipeParams {
  name: string
  /** 菜品图片 URL（选填；上传接口后端未实现，暂可填 URL） */
  photo?: string
  unit: string
  classify: string
  price: number
}

/** 批量删除菜品（interfaces.md §4.6） */
export interface BatchDeleteParams {
  ids: number[]
}

/** 食谱列表查询参数（interfaces.md §4.1） */
export interface RecipeQuery extends PageQuery {
  /** 菜名模糊搜索 */
  keyword?: string
  /** 按分类精确筛选 */
  classify?: string
}
