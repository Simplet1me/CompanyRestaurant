import { createTheme } from '@mui/material/styles'

/** 全局主题：品牌色、圆角等设计令牌在此统一调整 */
export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
  // 官方模板默认圆角
  shape: { borderRadius: 8 },
})
