import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  content?: string
  confirmText?: string
  /** 确认操作进行中（防重复点击） */
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

/** 删除等危险操作的确认弹窗 */
export default function ConfirmDialog({
  open,
  title,
  content,
  confirmText = '确定',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      {content && (
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
