import PrintIcon from '@mui/icons-material/Print'
import { Box, Button, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { getBlanketOrder, getOrderStatus } from '@/api/order'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { BlanketOrder as BlanketOrderType } from '@/types/order'
import { errMessage } from '@/utils/request'

/** 总括订单（interfaces.md §6.7）：厨房主管备料汇总 + 打印，权限：CHEF（MANAGER 也可） */
export default function BlanketOrderPage() {
  const { snackbar, showError } = useSnackbar()
  const [mealDate, setMealDate] = useState<Dayjs | null>(null)
  const [data, setData] = useState<BlanketOrderType | null>(null)
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
    getBlanketOrder(mealDate.format('YYYY-MM-DD'))
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
        <Typography variant="h5">总括订单</Typography>
        <DatePicker
          label="用餐日期"
          value={mealDate}
          onChange={setMealDate}
          format="YYYY-MM-DD"
          slotProps={{ textField: { size: 'small' } }}
        />
        <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!data}>
          打印
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        data && (
          <Paper id="print-area" sx={{ p: 4, maxWidth: 720 }}>
            <Typography variant="h5" align="center" sx={{ mb: 1 }}>
              总括订单
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              用餐日期：{data.mealDate}　·　用餐人数：{data.totalEmployeeCount} 人
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>菜名</TableCell>
                    <TableCell>单位</TableCell>
                    <TableCell>分量汇总</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((i) => (
                    <TableRow key={`${i.name}-${i.unit}`}>
                      <TableCell>{i.name}</TableCell>
                      <TableCell>{i.unit}</TableCell>
                      <TableCell>{i.totalQty}</TableCell>
                    </TableRow>
                  ))}
                  {data.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        当天暂无有效订单
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              打印时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}
            </Typography>
          </Paper>
        )
      )}

      {snackbar}
    </Box>
  )
}
