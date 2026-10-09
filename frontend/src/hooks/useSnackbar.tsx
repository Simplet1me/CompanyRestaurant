import { Alert, Snackbar } from '@mui/material'
import { useCallback, useState } from 'react'
import type { ReactElement } from 'react'

export interface SnackbarApi {
  /** 渲染在页面末尾的消息条元素 */
  snackbar: ReactElement
  showError: (msg: string) => void
  showSuccess: (msg: string) => void
}

/** 页面级消息提示：错误/成功 Snackbar */
export function useSnackbar(): SnackbarApi {
  const [open, setOpen] = useState(false)
  const [severity, setSeverity] = useState<'error' | 'success'>('error')
  const [msg, setMsg] = useState('')

  const show = useCallback((nextSeverity: 'error' | 'success', nextMsg: string) => {
    setSeverity(nextSeverity)
    setMsg(nextMsg)
    setOpen(true)
  }, [])

  const snackbar = (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={severity} variant="filled" onClose={() => setOpen(false)}>
        {msg}
      </Alert>
    </Snackbar>
  )

  return {
    snackbar,
    showError: useCallback((m: string) => show('error', m), [show]),
    showSuccess: useCallback((m: string) => show('success', m), [show]),
  }
}
