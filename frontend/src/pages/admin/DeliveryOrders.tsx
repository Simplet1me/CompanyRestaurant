import PrintIcon from '@mui/icons-material/Print'
import { Autocomplete, Box, Button, CircularProgress, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { getDeliveryOrders, getOrderStatus } from '@/api/order'
import { listUsers } from '@/api/user'
import { useAuth } from '@/context/AuthContext'
import type { UserItem } from '@/types/user'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { DeliveryOrder } from '@/types/order'
import { errMessage } from '@/utils/request'


export default function DeliveryOrdersPage() {
  const { user } = useAuth()
  const { snackbar, showError } = useSnackbar()
  const isManager = user?.role === 'MANAGER'
  const [deliverers, setDeliverers] = useState<UserItem[]>([])
  const [selectedDeliverer, setSelectedDeliverer] = useState<UserItem | null>(null)
  const [deliverersLoading, setDeliverersLoading] = useState(false)
  const [deliverersError, setDeliverersError] = useState('')
  const [reloadDeliverers, setReloadDeliverers] = useState(0)
  const delivererName = isManager ? selectedDeliverer?.name : user?.role === 'DELIVERER' ? user.name : undefined
  const [mealDate, setMealDate] = useState<Dayjs | null>(null)
  const [data, setData] = useState<DeliveryOrder | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setSelectedDeliverer(null)
    setDeliverers([])
    setDeliverersError('')
    if (!isManager) return
    setDeliverersLoading(true)
    const loadDeliverers = async () => {
      try {
        const all: UserItem[] = []
        for (let pageNum = 1; ; pageNum++) {
          const result = await listUsers({ role: 'DELIVERER', pageNum, pageSize: 100 })
          if (cancelled) return
          all.push(...result.list)
          if (all.length >= result.total || result.list.length === 0) break
        }
        setDeliverers(all)
      } catch (e) {
        if (!cancelled) setDeliverersError(errMessage(e))
      } finally {
        if (!cancelled) setDeliverersLoading(false)
      }
    }
    void loadDeliverers()
    return () => { cancelled = true }
  }, [isManager, user?.id, reloadDeliverers])

  // 初始用餐日期取服务端「最近一个可订用餐日期」
  useEffect(() => {
    getOrderStatus()
      .then((s) => {
        if (s.mealDate) setMealDate(dayjs(s.mealDate))
      })
      .catch(() => {})
  }, [])

  const load = useCallback(() => {
    if (!mealDate) return
    setLoading(true)
    getDeliveryOrders(mealDate.format('YYYY-MM-DD'))
      .then(setData)
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [mealDate, showError])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Box>
      <Stack direction="row" spacing={2} className="no-print" sx={{ alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">配餐打印</Typography>
        <DatePicker
          label="用餐日期"
          value={mealDate}
          onChange={setMealDate}
          format="YYYY-MM-DD"
          slotProps={{ textField: { size: 'small' } }}
        />
        {isManager ? (
          <Autocomplete
            options={deliverers}
            value={selectedDeliverer}
            onChange={(_, value) => setSelectedDeliverer(value)}
            getOptionLabel={(option) => `${option.name}（${option.loginName}）`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={deliverersLoading}
            loadingText="正在加载配餐员…"
            noOptionsText="暂无可选配餐员，请先在用户管理中添加"
            disabled={deliverersLoading}
            sx={{ minWidth: 280 }}
            renderInput={(params) => (
              <TextField {...params} label="指定配餐员" size="small" required
                error={!!deliverersError}
                helperText={deliverersError || '请选择本次打印的配餐员'} />
            )}
          />
        ) : (
          <Typography>配餐员：{delivererName}</Typography>
        )}
        {isManager && deliverersError && (
          <Button onClick={() => setReloadDeliverers((value) => value + 1)}>重新加载配餐员</Button>
        )}
        <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!data || loading || !data.orders.length || !delivererName || (isManager && deliverersLoading)}>
          批量打印
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        data && (
          <Paper id="print-area" sx={{ p: 4, maxWidth: 720 }}>
            <Typography variant="h5" align="center" sx={{ mb: 3 }}>
              批量订单（{data.mealDate}）
            </Typography>
            {data.orders.map((o) => (
              <Box key={o.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, mb: 2 }}>
                <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">员工：{o.empName}</Typography>
                  <Typography variant="subtitle2">电话：{o.phone}</Typography>
                  <Typography variant="subtitle2">工位：{o.workstation}</Typography>
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>菜名</TableCell>
                        <TableCell>单位</TableCell>
                        <TableCell>分量</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {o.items.map((i, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{i.name}</TableCell>
                          <TableCell>{i.unit}</TableCell>
                          <TableCell>{i.qty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
            {data.orders.length === 0 && <Typography align="center">当天暂无订单</Typography>}
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2">送餐员：{delivererName || '请先指定配餐员'}</Typography>
              <Typography variant="body2">打印时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}</Typography>
            </Stack>
          </Paper>
        )
      )}

      {snackbar}
    </Box>
  )
}
