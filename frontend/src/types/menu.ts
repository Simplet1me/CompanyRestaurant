
export type MenuStatus = 'USE' | 'HISTORY'


export interface MenuSummary {
  id: number
  name: string
  status: MenuStatus
  createTime: string
}


export interface MenuItem {
  id: number
  name: string
  photo?: string
  unit: string
  classify: string
  price: number
}


export interface MenuDetail extends MenuSummary {
  items: MenuItem[]
}


export interface CreateMenuParams {
  name: string
  recipeIds: number[]
}


export interface MenuItemPriceParams {
  price: number
}
