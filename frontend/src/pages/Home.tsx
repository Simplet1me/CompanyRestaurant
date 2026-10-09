import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { getCurrentMenu } from '@/api/menu'
import { createOrder, getOrderStatus } from '@/api/order'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { MenuDetail, MenuItem } from '@/types/menu'
import type { Order, OrderStatus } from '@/types/order'
import { formatMoney } from '@/utils/format'
import { errMessage } from '@/utils/request'

/** 点餐首页（interfaces.md §5.2 + §6.1 + §6.2）：当前菜单点餐 */
export default function HomePage() {
  const { snackbar, showError } = useSnackbar()
  const [status, setStatus] = useState<OrderStatus | null>(null)
  const [menu, setMenu] = useState<MenuDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [successOrder, setSuccessOrder] = useState<Order | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([getOrderStatus(), getCurrentMenu()])
      .then(([s, m]) => {
        setStatus(s)
        setMenu(m)
      })
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [showError])

  useEffect(() => {
    load()
  }, [load])

  const setQty = (menuItemId: number, qty: number) =>
    setCart((prev) => ({ ...prev, [menuItemId]: Math.max(0, qty) }))

  const totalQty = Object.values(cart).reduce((sum, q) => sum + q, 0)
  const totalPrice = (menu?.items ?? []).reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0)

  const handleSubmit = async () => {
    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([menuItemId, qty]) => ({ menuItemId: Number(menuItemId), qty }))
    setSubmitting(true)
    try {
      const order = await createOrder({ items })
      setCart({})
      setSuccessOrder(order)
    } catch (e) {
      showError(errMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {status &&
        (status.canOrder ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            当前可订餐：本次订单的用餐日期为 {status.mealDate}（订餐截止 {status.deadline}，配餐开始{' '}
            {status.serveStartTime}）
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {status.reason ?? '当前不在订餐时间窗口内'}（订餐截止 {status.deadline}，配餐开始{' '}
            {status.serveStartTime}）
          </Alert>
        ))}

      {menu === null ? (
        <Alert severity="info">暂无使用中的菜单</Alert>
      ) : (
        <>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">{menu.name}</Typography>
            <Button size="small" onClick={load}>
              刷新
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {menu.items.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <MenuItemCard item={item} qty={cart[item.id] ?? 0} onQtyChange={(q) => setQty(item.id, q)} />
              </Grid>
            ))}
          </Grid>
          {menu.items.length === 0 && <Alert severity="info">当前菜单暂无菜品</Alert>}
        </>
      )}

      {/* 底部结算栏 */}
      {menu && menu.items.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            bottom: 16,
            mt: 3,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography>
            已选 {totalQty} 份 · 合计{' '}
            <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
              {formatMoney(totalPrice)}
            </Typography>
          </Typography>
          <Button
            variant="contained"
            size="large"
            disabled={!status?.canOrder || totalQty === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : '提交订单'}
          </Button>
        </Paper>
      )}

      {/* 下单成功弹窗 */}
      <Dialog open={!!successOrder} onClose={() => setSuccessOrder(null)}>
        <DialogTitle>下单成功</DialogTitle>
        <DialogContent>
          {successOrder && (
            <Stack spacing={1}>
              <Typography>用餐日期：{successOrder.mealDate}</Typography>
              {successOrder.items.map((i) => (
                <Typography key={i.id}>
                  {i.name} × {i.qty} {i.unit} = {formatMoney(i.amount)}
                </Typography>
              ))}
              <Divider />
              <Typography>合计：{formatMoney(successOrder.totalPrice)}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessOrder(null)}>完成</Button>
        </DialogActions>
      </Dialog>

      {snackbar}
    </Box>
  )
}

/** 菜单项卡片：图片 + 名称 + 分类 + 单价 + 数量步进器 */
function MenuItemCard({
  item,
  qty,
  onQtyChange,
}: {
  item: MenuItem
  qty: number
  onQtyChange: (qty: number) => void
}) {
  const [imgError, setImgError] = useState(false)
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          overflow: 'hidden',
        }}
      >
        {item.photo && !imgError ? (
          <Box
            component="img"
            src={item.photo}
            alt={item.name}
            onError={() => setImgError(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <RestaurantMenuIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">{item.name}</Typography>
          <Chip label={item.classify} size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {formatMoney(item.price)} / {item.unit}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            数量（{item.unit}）
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={() => onQtyChange(qty - 1)} aria-label="减少">
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{qty}</Typography>
            <IconButton size="small" onClick={() => onQtyChange(qty + 1)} aria-label="增加">
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
