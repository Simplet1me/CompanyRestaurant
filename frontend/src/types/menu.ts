/** 菜单状态（interfaces.md §0.6） */
export type MenuStatus = 'USE' | 'HISTORY'

/** 菜单列表元素（interfaces.md §5.1） */
export interface MenuSummary {
  id: number
  name: string
  status: MenuStatus
  createTime: string
}

/** 菜单项（interfaces.md §5.2 items 元素） */
export interface MenuItem {
  id: number
  name: string
  photo?: string
  unit: string
  classify: string
  price: number
}

/** 菜单详情（含 items，interfaces.md §5.2/§5.4） */
export interface MenuDetail extends MenuSummary {
  items: MenuItem[]
}

/** 创建菜单（interfaces.md §5.3） */
export interface CreateMenuParams {
  name: string
  recipeIds: number[]
}

/** 修改菜单菜品价格（interfaces.md §5.6） */
export interface MenuItemPriceParams {
  price: number
}
