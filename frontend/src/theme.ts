import { createTheme } from '@mui/material/styles'

/** 全局主题：品牌色、圆角等设计令牌在此统一调整 */
export const theme = createTheme({
  palette: {
    primary: { main: '#2563eb', dark: '#1d4ed8' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    divider: '#e5eaf2',
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    h6: { fontWeight: 700, fontSize: '1.125rem' },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 4, paddingInline: 18 } },
    },
    MuiCard: {
      styleOverrides: { root: { border: '1px solid #e5eaf2', boxShadow: '0 3px 14px rgba(30, 41, 59, 0.04)' } },
    },
    MuiTableContainer: {
      styleOverrides: { root: { border: '1px solid #e5eaf2', borderRadius: 4, boxShadow: 'none' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { backgroundColor: '#f8fafc', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' },
        root: { borderBottomColor: '#edf0f5', paddingTop: 14, paddingBottom: 14 },
      },
    },
    MuiTableRow: { styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#fff' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 6 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 4 } } },
  },
})
