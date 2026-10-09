import PrintIcon from '@mui/icons-material/Print'
import { Box, Button, CircularProgress, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { getDeliveryOrders, getOrderStatus } from '@/api/order'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { DeliveryOrder } from '@/types/order'
import { errMessage } from '@/utils/request'

/** 配餐打印（interfaces.md §6.8）：批量打印所有订单，权限：DELIVERER（MANAGER 也可） */
export default function DeliveryOrdersPage() {
  const { snackbar, showError } = useSnackbar()
  const [mealDate, setMealDate] = useState<Dayjs | null>(null)
  const [data, setData] = useState<DeliveryOrder | null>(null)
  const [loading, setLoading] = useState(false)

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
        <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!data}>
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
              <Typography variant="body2">送餐员：__________</Typography>
              <Typography variant="body2">打印时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}</Typography>
            </Stack>
          </Paper>
        )
      )}

      {snackbar}
    </Box>
  )
}
