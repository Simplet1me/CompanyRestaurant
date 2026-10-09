import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { getConfigs, updateConfigs } from '@/api/config'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/hooks/useSnackbar'
import { errMessage } from '@/utils/request'

/** 系统配置（interfaces.md §8）：订餐截止时间 / 配餐开始时间，修改仅 MANAGER */
export default function ConfigsPage() {
  const { user } = useAuth()
  const isManager = user?.role === 'MANAGER'
  const { snackbar, showError, showSuccess } = useSnackbar()
  const [deadline, setDeadline] = useState<Dayjs | null>(null)
  const [serveStart, setServeStart] = useState<Dayjs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getConfigs()
      .then((c) => {
        setDeadline(dayjs(c.orderDeadline, 'HH:mm'))
        setServeStart(dayjs(c.serveStartTime, 'HH:mm'))
      })
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [showError])

  const handleSave = async () => {
    if (!deadline || !serveStart) {
      showError('请填写完整的时间参数')
      return
    }
    if (!serveStart.isAfter(deadline)) {
      showError('配餐开始时间必须晚于订餐截止时间')
      return
    }
    setSaving(true)
    try {
      await updateConfigs({
        orderDeadline: deadline.format('HH:mm'),
        serveStartTime: serveStart.format('HH:mm'),
      })
      showSuccess('参数已保存')
    } catch (e) {
      showError(errMessage(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        系统配置
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        订餐规则：截止时间前可订当天午餐；配餐开始时间后可订次日午餐（interfaces.md §6.1 / requirements.md
        §5.1）
      </Alert>
      <Paper sx={{ p: 3, maxWidth: 560 }}>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', mb: 3 }}>
          <TimePicker
            label="订餐截止时间"
            value={deadline}
            onChange={setDeadline}
            format="HH:mm"
            ampm={false}
            disabled={!isManager}
            slotProps={{ textField: { size: 'small' } }}
          />
          <TimePicker
            label="配餐开始时间"
            value={serveStart}
            onChange={setServeStart}
            format="HH:mm"
            ampm={false}
            disabled={!isManager}
            slotProps={{ textField: { size: 'small' } }}
          />
          {isManager && (
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={24} color="inherit" /> : '保存'}
            </Button>
          )}
        </Stack>
        {!isManager && (
          <Typography variant="body2" color="text.secondary">
            仅餐厅经理（MANAGER）可修改系统参数
          </Typography>
        )}
      </Paper>
      {snackbar}
    </Box>
  )
}
