import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { uploadImage } from '@/api/file'
import { errMessage } from '@/utils/request'

export default function ImageUpload({ value, onChange, onBusyChange, onError, disabled }: {
  value: string; onChange: (url: string) => void; onBusyChange: (busy: boolean) => void
  onError: (message: string) => void; disabled: boolean
}) {
  const [busy, setBusy] = useState(false)
  return <Stack spacing={1}>
    <Typography variant="body2">菜品图片（选填）</Typography>
    {value && <Box component="img" src={value} alt="菜品预览" sx={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 1 }} />}
    <Stack direction="row" spacing={1}>
      <Button component="label" variant="outlined" disabled={disabled || busy}>
        {busy ? '正在上传…' : value ? '更换图片' : '上传图片'}
        <input hidden type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            onError('请选择不超过5MB的JPEG、PNG、GIF或WebP图片'); return
          }
          setBusy(true); onBusyChange(true)
          try { onChange(await uploadImage(file)) }
          catch (error) { onError(errMessage(error)) }
          finally { setBusy(false); onBusyChange(false) }
        }} />
      </Button>
      {value && <Button disabled={disabled || busy} onClick={() => onChange('')}>移除图片</Button>}
    </Stack>
    <Typography variant="caption" color="text.secondary">支持 JPEG、PNG、GIF、WebP，最大 5MB</Typography>
  </Stack>
}
