import { Box, CircularProgress } from '@mui/material'
import type { ReactElement } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import HomePage from '@/pages/Home'
import LoginPage from '@/pages/Login'
import BlanketOrderPage from '@/pages/admin/BlanketOrder'
import ConfigsPage from '@/pages/admin/Configs'
import DeliveryOrdersPage from '@/pages/admin/DeliveryOrders'
import MenusPage from '@/pages/admin/Menus'
import OrdersPage from '@/pages/admin/Orders'
import RecipesPage from '@/pages/admin/Recipes'
import ReportsPage from '@/pages/admin/Reports'
import UsersPage from '@/pages/admin/Users'
import AppLayout from '@/pages/layout/AppLayout'
import MyOrdersPage from '@/pages/my/MyOrders'
import MyReportsPage from '@/pages/my/MyReports'

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
      { path: 'my/orders', element: <MyOrdersPage /> },
      { path: 'my/reports', element: <MyReportsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'recipes', element: <RecipesPage /> },
      { path: 'menus', element: <MenusPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/blanket', element: <BlanketOrderPage /> },
      { path: 'orders/delivery', element: <DeliveryOrdersPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'configs', element: <ConfigsPage /> },
    ],
  },
])
