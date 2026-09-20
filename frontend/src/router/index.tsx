import { Box, CircularProgress } from '@mui/material'
import type { ReactElement } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import HomePage from '@/pages/Home'
import LoginPage from '@/pages/Login'
import PlaceholderPage from '@/pages/Placeholder'
import AppLayout from '@/pages/layout/AppLayout'

/** 登录守卫：未登录跳转登录页；启动恢复登录态期间显示 loading */
function RequireAuth({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

/** 模块占位路由（对应导航菜单，各模块页面开发完成后替换为真实页面） */
const placeholderRoutes = [
  { path: 'my/orders', title: '我的订单' },
  { path: 'my/reports', title: '我的统计' },
  { path: 'users', title: '用户管理' },
  { path: 'recipes', title: '食谱管理' },
  { path: 'menus', title: '菜单管理' },
  { path: 'orders', title: '订单管理' },
  { path: 'orders/blanket', title: '总括订单' },
  { path: 'orders/delivery', title: '配餐打印' },
  { path: 'reports', title: '统计报表' },
  { path: 'configs', title: '系统配置' },
]

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      ...placeholderRoutes.map((route) => ({
        path: route.path,
        element: <PlaceholderPage title={route.title} />,
      })),
    ],
  },
])
