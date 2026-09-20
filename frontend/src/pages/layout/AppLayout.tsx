import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '@/api/auth'
import { useAuth } from '@/context/AuthContext'
import { NAV_ITEMS } from '@/router/menu'
import { ROLE_LABELS } from '@/utils/constants'

const DRAWER_WIDTH = 240

/** 侧边栏品牌区（官方 Dashboard 模板结构） */
function BrandHeader() {
  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ px: 2, minHeight: 64, alignItems: 'center' }}>
        <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <RestaurantMenuIcon fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
          企业餐厅网络点餐系统
        </Typography>
      </Stack>
      <Divider />
    </>
  )
}

/**
 * 应用主布局，结构参考官方 Dashboard 模板：
 * 左侧 Aside（桌面端永久抽屉 / 移动端临时抽屉）+ 右侧主列（Header + 内容 + Footer）
 */
export default function AppLayout() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  // 官方 Responsive drawer 模式：桌面端 permanent，移动端 temporary
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  // 按角色过滤导航（权限矩阵见 requirements.md §2）
  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)))

  // Header 标题跟随当前页面
  const currentTitle =
    NAV_ITEMS.find((item) => item.path === location.pathname)?.label ?? '企业餐厅网络点餐系统'

  const handleLogout = async () => {
    setMenuAnchor(null)
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // 服务端登出失败也清理本地登录态
    } finally {
      setUser(null)
      setLoggingOut(false)
      navigate('/login', { replace: true })
    }
  }

  const drawerContent = (
    <>
      <BrandHeader />
      <List>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path)
              setMobileOpen(false)
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Aside：桌面端永久抽屉 / 移动端临时抽屉 */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* 主列：Header + 内容 + Footer */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header：sticky 顶栏，风格参考官方模板（底部描边分隔） */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}
        >
          <Toolbar>
            {!isDesktop && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="打开导航"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              {currentTitle}
            </Typography>
            {/* 官方 App bar with menu 模式：头像按钮 + 下拉菜单 */}
            <Tooltip title={user?.name ?? ''}>
              <IconButton
                size="small"
                aria-label="用户菜单"
                onClick={(e: MouseEvent<HTMLButtonElement>) => setMenuAnchor(e.currentTarget)}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 16 }}>
                  {user?.name?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user && ROLE_LABELS[user.role]} · {user?.loginName}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} disabled={loggingOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                退出登录
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* 内容区 */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{ py: 2, px: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}
        >
          <Typography variant="body2" color="text.secondary">
            企业餐厅网络点餐系统 · Java Web 课程设计
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
