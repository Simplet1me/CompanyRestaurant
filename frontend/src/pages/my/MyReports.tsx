import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { getMyMonthlyReport, getMyOrdersReport } from '@/api/report'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { EmployeeMonthlyReport, PersonalMonthlyReport } from '@/types/report'
import { formatMoney } from '@/utils/format'
import { errMessage } from '@/utils/request'

/** 我的统计（interfaces.md §7.5 个人月度消费统计 / §7.7 个人月度订单汇总） */
export default function MyReportsPage() {
  const { snackbar, showError } = useSnackbar()
  const [month, setMonth] = useState<Dayjs | null>(dayjs())
  const [tab, setTab] = useState(0)
  const [monthly, setMonthly] = useState<PersonalMonthlyReport | null>(null)
  const [ordersReport, setOrdersReport] = useState<EmployeeMonthlyReport | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    if (!month) return
    const m = month.format('YYYY-MM')
    setLoading(true)
    Promise.all([getMyMonthlyReport(m), getMyOrdersReport(m)])
      .then(([a, b]) => {
        setMonthly(a)
        setOrdersReport(b)
      })
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [month, showError])

  useEffect(() => {
    load()
  }, [load])

  const exportDisabled = (
    // TODO: 报表导出接口后端未实现（interfaces.md §7.6/§7.8），实现后启用
    <Tooltip title="报表导出后端未实现（TODO）">
      <span>
        <Button size="small" variant="outlined" disabled>
          导出 Excel
        </Button>
      </span>
    </Tooltip>
  )

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">我的统计</Typography>
        <DatePicker
          label="统计月份"
          views={['year', 'month']}
          format="YYYY-MM"
          value={month}
          onChange={setMonth}
          slotProps={{ textField: { size: 'small' } }}
        />
        {exportDisabled}
      </Stack>

      <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="月度消费统计" />
        <Tab label="月度订单汇总" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : tab === 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>菜品</TableCell>
                <TableCell>单位</TableCell>
                <TableCell>分量</TableCell>
                <TableCell>加权均价</TableCell>
                <TableCell>金额</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(monthly?.items ?? []).map((i) => (
                <TableRow key={`${i.name}-${i.unit}`}>
                  <TableCell>{i.name}</TableCell>
                  <TableCell>{i.unit}</TableCell>
                  <TableCell>{i.totalQty}</TableCell>
                  <TableCell>{formatMoney(i.avgPrice)}</TableCell>
                  <TableCell>{formatMoney(i.totalAmount)}</TableCell>
                </TableRow>
              ))}
              {monthly && (
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    合计金额
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatMoney(monthly.totalAmount)}</TableCell>
                </TableRow>
              )}
              {!monthly && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Stack spacing={2}>
          {ordersReport && (
            <Alert severity="info">
              {ordersReport.employee.name} · {ordersReport.employee.phone} · {ordersReport.employee.workstation}{' '}
              · 合计 {formatMoney(ordersReport.monthTotalAmount)}
            </Alert>
          )}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>用餐日期</TableCell>
                  <TableCell>下单时间</TableCell>
                  <TableCell>明细</TableCell>
                  <TableCell>金额</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(ordersReport?.orders ?? []).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.mealDate}</TableCell>
                    <TableCell>{o.createTime}</TableCell>
                    <TableCell>{o.items.map((i) => `${i.name}×${i.qty}${i.unit}`).join('、')}</TableCell>
                    <TableCell>{formatMoney(o.totalPrice)}</TableCell>
                  </TableRow>
                ))}
                {!ordersReport && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}

      {snackbar}
    </Box>
  )
}
