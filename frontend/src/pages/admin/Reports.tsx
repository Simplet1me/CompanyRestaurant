import {
  Autocomplete,
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
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { getEmployeeMonthlyReport, getMonthlyReport } from '@/api/report'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { EmployeeMonthlyReport, MonthlyReport } from '@/types/report'
import type { UserItem } from '@/types/user'
import { formatMoney } from '@/utils/format'
import { errMessage, http } from '@/utils/request'
import type { PageResult } from '@/types/common'
import { downloadExcel } from '@/api/file'


export default function ReportsPage() {
  const { snackbar, showError } = useSnackbar()
  const [month, setMonth] = useState<Dayjs | null>(dayjs())
  const [tab, setTab] = useState(0)
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<UserItem[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<UserItem | null>(null)
  const employeeId = selectedEmployee?.id ?? null
  const [employeeReport, setEmployeeReport] = useState<EmployeeMonthlyReport | null>(null)
  const [employeeLoading, setEmployeeLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      http.get<PageResult<UserItem>>('/reports/employees', { keyword: employeeSearch })
        .then((res) => { if (active) setEmployees(res.list) })
        .catch((e) => { if (active) showError(errMessage(e)) })
    }, 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [employeeSearch, showError])

  const loadMonthly = useCallback(() => {
    if (!month) return
    const m = month.format('YYYY-MM')
    setLoading(true)
    getMonthlyReport(m)
      .then(setMonthly)
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [month, showError])

  useEffect(() => {
    loadMonthly()
  }, [loadMonthly])

  const loadEmployee = useCallback(() => {
    if (!month || employeeId == null) {
      setEmployeeReport(null)
      return
    }
    setEmployeeLoading(true)
    getEmployeeMonthlyReport(employeeId, month.format('YYYY-MM'))
      .then(setEmployeeReport)
      .catch((e) => showError(errMessage(e)))
      .finally(() => setEmployeeLoading(false))
  }, [month, employeeId, showError])

  useEffect(() => {
    loadEmployee()
  }, [loadEmployee])

  const handleExport = async () => {
    if (!month?.isValid() || (tab === 1 && employeeId == null)) return
    setExporting(true)
    try {
      const path = tab === 0 ? '/reports/monthly/export' : `/reports/employee/${employeeId}/export`
      const title = tab === 0 ? '月度销售统计总报表' : `员工月度订单汇总表_${employeeReport?.employee.name ?? employeeId}`
      await downloadExcel(path, `${title}_${month.format('YYYY-MM')}`, { month: month.format('YYYY-MM') })
    } catch (e) { showError(errMessage(e)) }
    finally { setExporting(false) }
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">统计报表</Typography>
        <DatePicker
          label="统计月份"
          views={['year', 'month']}
          format="YYYY-MM"
          value={month}
          onChange={setMonth}
          slotProps={{ textField: { size: 'small' } }}
        />
        <Button size="small" variant="outlined" onClick={handleExport}
          disabled={exporting || !month?.isValid() || (tab === 1 && employeeId == null)}>
          {exporting ? '正在导出…' : '导出 Excel'}
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="月度销售统计" />
        <Tab label="员工月度订单汇总" />
      </Tabs>

      {tab === 0 ? (
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : (
                <>
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
                        总计金额
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{formatMoney(monthly.totalAmount)}</TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Stack spacing={2}>
          <Autocomplete
            options={employees}
            filterOptions={(options) => options}
            onInputChange={(_, value, reason) => { if (reason === 'input' || reason === 'clear') setEmployeeSearch(value) }}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            getOptionLabel={(u) => `${u.name}（${u.loginName}）`}
            value={selectedEmployee}
            onChange={(_, v) => setSelectedEmployee(v)}
            renderInput={(params) => <TextField {...params} label="选择员工" size="small" />}
            sx={{ width: 320 }}
          />
          {employeeLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            employeeReport && (
              <>
                <Stack direction="row" spacing={3}>
                  <Typography variant="body2">员工：{employeeReport.employee.name}</Typography>
                  <Typography variant="body2">电话：{employeeReport.employee.phone}</Typography>
                  <Typography variant="body2">部门：{employeeReport.employee.department ?? '-'}</Typography>
                  <Typography variant="body2">工位：{employeeReport.employee.workstation}</Typography>
                </Stack>
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
                      {employeeReport.orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell>{o.mealDate}</TableCell>
                          <TableCell>{o.createTime}</TableCell>
                          <TableCell>{o.items.map((i) => `${i.name}×${i.qty}${i.unit}`).join('、')}</TableCell>
                          <TableCell>{formatMoney(o.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          月度合计
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {formatMoney(employeeReport.monthTotalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )
          )}
        </Stack>
      )}

      {snackbar}
    </Box>
  )
}
