import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { listMyOrders } from '@/api/order'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { PageResult } from '@/types/common'
import type { Order } from '@/types/order'
import { formatMoney } from '@/utils/format'
import { errMessage } from '@/utils/request'

/** 我的订单（interfaces.md §6.3） */
export default function MyOrdersPage() {
  const { snackbar, showError } = useSnackbar()
  const [mealDate, setMealDate] = useState<Dayjs | null>(null)
  const [data, setData] = useState<PageResult<Order>>({ total: 0, list: [] })
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<Order | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    listMyOrders({ pageNum, pageSize, mealDate: mealDate ? mealDate.format('YYYY-MM-DD') : undefined })
      .then(setData)
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [pageNum, pageSize, mealDate, showError])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">我的订单</Typography>
        <DatePicker
          label="用餐日期"
          value={mealDate}
          onChange={(v) => {
            setMealDate(v)
            setPageNum(1)
          }}
          format="YYYY-MM-DD"
          slotProps={{ textField: { size: 'small' } }}
        />
        {mealDate && (
          <Button size="small" onClick={() => setMealDate(null)}>
            清除筛选
          </Button>
        )}
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>订单号</TableCell>
              <TableCell>用餐日期</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>下单时间</TableCell>
              <TableCell>金额</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.list.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.id}</TableCell>
                <TableCell>{o.mealDate}</TableCell>
                <TableCell>
                  {o.status === 'VALID' ? <Chip label="有效" color="success" size="small" /> : <Chip label="已取消" size="small" />}
                </TableCell>
                <TableCell>{o.createTime}</TableCell>
                <TableCell>{formatMoney(o.totalPrice)}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setDetail(o)}>
                    查看
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && data.list.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  暂无订单
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.total}
          page={pageNum - 1}
          onPageChange={(_, p) => setPageNum(p + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10))
            setPageNum(1)
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="每页行数"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
        />
      </TableContainer>

      {/* 订单详情 */}
      <Dialog open={!!detail} onClose={() => setDetail(null)}>
        <DialogTitle>订单 #{detail?.id}</DialogTitle>
        <DialogContent>
          {detail && (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                用餐日期：{detail.mealDate} · 下单时间：{detail.createTime}
              </Typography>
              {detail.items.map((i) => (
                <Typography key={i.id}>
                  {i.name} × {i.qty} {i.unit} = {formatMoney(i.amount)}
                </Typography>
              ))}
              <Divider />
              <Typography>合计：{formatMoney(detail.totalPrice)}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {snackbar}
    </Box>
  )
}
