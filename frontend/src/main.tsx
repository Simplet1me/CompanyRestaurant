import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { router } from '@/router'
import { theme } from '@/theme'
import 'dayjs/locale/zh-cn'
import './index.css'

// 全局中文日期处理（与后端日期格式 yyyy-MM-dd HH:mm:ss 等配合展示）
dayjs.locale('zh-cn')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      {/* LocalizationProvider：MUI 日期/月份选择器使用 dayjs + 中文 */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
        <CssBaseline />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
)
