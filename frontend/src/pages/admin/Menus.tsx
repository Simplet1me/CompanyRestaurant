import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  activateMenu,
  addMenuItems,
  createMenu,
  deleteMenu,
  deleteMenuItem,
  getMenu,
  listMenus,
  updateMenuItemPrice,
} from '@/api/menu'
import { listRecipes } from '@/api/recipe'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { PageResult } from '@/types/common'
import type { MenuDetail, MenuItem, MenuSummary } from '@/types/menu'
import type { Recipe } from '@/types/recipe'
import { formatMoney } from '@/utils/format'
import { errMessage } from '@/utils/request'

/** 菜单管理（interfaces.md §5）权限：MANAGER */
export default function MenusPage() {
  const { snackbar, showError, showSuccess } = useSnackbar()
  const [data, setData] = useState<PageResult<MenuSummary>>({ total: 0, list: [] })
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [activateTarget, setActivateTarget] = useState<MenuSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MenuSummary | null>(null)
  const [acting, setActing] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    listMenus({ pageNum, pageSize })
      .then(setData)
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [pageNum, pageSize, showError])

  useEffect(() => {
    load()
  }, [load])

  const handleActivate = async () => {
    if (!activateTarget) return
    setActing(true)
    try {
      await activateMenu(activateTarget.id)
      showSuccess('菜单已启用')
      setActivateTarget(null)
      load()
    } catch (e) {
      showError(errMessage(e))
    } finally {
      setActing(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActing(true)
    try {
      await deleteMenu(deleteTarget.id)
      showSuccess('删除成功')
      setDeleteTarget(null)
      load()
    } catch (e) {
      showError(errMessage(e))
    } finally {
      setActing(false)
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">菜单管理</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" size="small" onClick={() => setCreateOpen(true)}>
          创建菜单
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>菜单名字</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.list.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.name}</TableCell>
                <TableCell>
                  {m.status === 'USE' ? (
                    <Chip label="使用中" color="success" size="small" />
                  ) : (
                    <Chip label="历史" size="small" />
                  )}
                </TableCell>
                <TableCell>{m.createTime}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setDetailId(m.id)}>
                    详情
                  </Button>
                  {m.status !== 'USE' && (
                    <Button size="small" color="primary" onClick={() => setActivateTarget(m)}>
                      启用
                    </Button>
                  )}
                  <Button size="small" color="error" onClick={() => setDeleteTarget(m)}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && data.list.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  暂无菜单
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

      <CreateMenuDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          showSuccess('菜单创建成功')
          load()
        }}
      />
      <MenuDetailDialog menuId={detailId} onClose={() => setDetailId(null)} onChanged={load} />
      <ConfirmDialog
        open={!!activateTarget}
        title="启用菜单"
        content={activateTarget ? `确定启用「${activateTarget.name}」吗？当前使用中的菜单将自动转为历史。` : undefined}
        confirmText="启用"
        loading={acting}
        onConfirm={handleActivate}
        onClose={() => setActivateTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除菜单"
        content={deleteTarget ? `确定删除「${deleteTarget.name}」吗？使用中的菜单不可删除。` : undefined}
        confirmText="删除"
        loading={acting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {snackbar}
    </Box>
  )
}

/** 创建菜单弹窗（interfaces.md §5.3） */
function CreateMenuDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const { snackbar, showError } = useSnackbar()
  const [name, setName] = useState('')
  const [recipeIds, setRecipeIds] = useState<number[]>([])
  const [errors, setErrors] = useState<{ name?: string; ids?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!name.trim()) next.name = '请输入菜单名字'
    if (recipeIds.length === 0) next.ids = '请至少选择一个菜品'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setSubmitting(true)
    try {
      await createMenu({ name: name.trim(), recipeIds })
      onCreated()
    } catch (err) {
      showError(errMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>创建菜单</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="菜单名字"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name ?? '如：第 40 周菜单'}
              fullWidth
              required
              autoFocus
            />
            <Box>
              <Typography variant="body2" color={errors.ids ? 'error' : 'text.secondary'} sx={{ mb: 1 }}>
                {errors.ids ?? '选择菜品（菜品信息从食谱快照复制）'}
              </Typography>
              <RecipePicker selected={recipeIds} onChange={setRecipeIds} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : '创建'}
          </Button>
        </DialogActions>
      </Box>
      {snackbar}
    </Dialog>
  )
}

/** 菜品多选器（创建菜单 / 添加菜品共用） */
function RecipePicker({ selected, onChange }: { selected: number[]; onChange: (ids: number[]) => void }) {
  const { snackbar, showError } = useSnackbar()
  const [keyword, setKeyword] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    listRecipes({ pageNum: 1, pageSize: 100, keyword: keyword.trim() || undefined })
      .then((res) => setRecipes(res.list))
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [keyword, showError])

  useEffect(() => {
    load()
  }, [load])

  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  return (
    <Box>
      <TextField
        size="small"
        label="搜索菜品"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        fullWidth
        sx={{ mb: 1 }}
      />
      <List
        dense
        sx={{ maxHeight: 240, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, py: 0 }}
      >
        {recipes.map((r) => (
          <ListItemButton key={r.id} onClick={() => toggle(r.id)}>
            <Checkbox edge="start" checked={selected.includes(r.id)} tabIndex={-1} disableRipple />
            <ListItemText primary={r.name} secondary={`${r.classify} · ${r.unit} · ${formatMoney(r.price)}`} />
          </ListItemButton>
        ))}
        {!loading && recipes.length === 0 && (
          <ListItem>
            <ListItemText primary="无匹配菜品" sx={{ textAlign: 'center' }} />
          </ListItem>
        )}
      </List>
      {snackbar}
    </Box>
  )
}

/** 菜单详情弹窗（interfaces.md §5.4/§5.5/§5.6/§5.7）：管理菜单菜品 */
function MenuDetailDialog({
  menuId,
  onClose,
  onChanged,
}: {
  menuId: number | null
  onClose: () => void
  onChanged: () => void
}) {
  const { snackbar, showError, showSuccess } = useSnackbar()
  const [menu, setMenu] = useState<MenuDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addIds, setAddIds] = useState<number[]>([])
  const [adding, setAdding] = useState(false)
  const [priceTarget, setPriceTarget] = useState<MenuItem | null>(null)
  const [priceValue, setPriceValue] = useState('')
  const [priceError, setPriceError] = useState('')
  const [priceSaving, setPriceSaving] = useState(false)
  const [deleteItemTarget, setDeleteItemTarget] = useState<MenuItem | null>(null)
  const [itemDeleting, setItemDeleting] = useState(false)

  const load = useCallback(() => {
    if (menuId == null) return
    setLoading(true)
    getMenu(menuId)
      .then(setMenu)
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [menuId, showError])

  useEffect(() => {
    load()
  }, [load])

  // 打开弹窗时重置添加状态
  useEffect(() => {
    setAddOpen(false)
    setAddIds([])
  }, [menuId])

  const handleAdd = async () => {
    if (menuId == null) return
    setAdding(true)
    try {
      await addMenuItems(menuId, addIds)
      showSuccess(`已添加 ${addIds.length} 个菜品`)
      setAddOpen(false)
      setAddIds([])
      load()
      onChanged()
    } catch (e) {
      showError(errMessage(e))
    } finally {
      setAdding(false)
    }
  }

  const handlePriceSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!priceTarget) return
    const price = parseFloat(priceValue)
    if (Number.isNaN(price) || price <= 0) {
      setPriceError('价格须为大于 0 的数字')
      return
    }
    setPriceSaving(true)
    try {
      await updateMenuItemPrice(priceTarget.id, Math.round(price * 100) / 100)
      showSuccess('价格已更新')
      setPriceTarget(null)
      load()
      onChanged()
    } catch (err) {
      showError(errMessage(err))
    } finally {
      setPriceSaving(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteItemTarget) return
    setItemDeleting(true)
    try {
      await deleteMenuItem(deleteItemTarget.id)
      showSuccess('菜品已从菜单移除')
      setDeleteItemTarget(null)
      load()
      onChanged()
    } catch (e) {
      showError(errMessage(e))
    } finally {
      setItemDeleting(false)
    }
  }

  return (
    <Dialog open={menuId != null} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {menu?.name ?? '菜单详情'}
        {menu?.status === 'USE' && <Chip label="使用中" color="success" size="small" sx={{ ml: 1 }} />}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          menu && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>菜名</TableCell>
                    <TableCell>分类</TableCell>
                    <TableCell>单位</TableCell>
                    <TableCell>价格</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menu.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.classify}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{formatMoney(item.price)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setPriceTarget(item)
                            setPriceValue(String(item.price))
                            setPriceError('')
                          }}
                        >
                          改价
                        </Button>
                        <Button size="small" color="error" onClick={() => setDeleteItemTarget(item)}>
                          移除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {menu.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        菜单暂无菜品
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAddOpen(true)}>添加菜品</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>

      {/* 添加菜品 */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加菜品</DialogTitle>
        <DialogContent>
          <RecipePicker selected={addIds} onChange={setAddIds} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={adding}>
            取消
          </Button>
          <Button variant="contained" disabled={addIds.length === 0 || adding} onClick={handleAdd}>
            {adding ? <CircularProgress size={24} color="inherit" /> : `添加（${addIds.length}）`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 修改价格 */}
      <Dialog open={!!priceTarget} onClose={() => setPriceTarget(null)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handlePriceSave}>
          <DialogTitle>修改价格：{priceTarget?.name}</DialogTitle>
          <DialogContent>
            <TextField
              label="价格（元）"
              type="number"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              error={!!priceError}
              helperText={priceError ?? '仅影响本菜单该菜品，不影响食谱'}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
              fullWidth
              autoFocus
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPriceTarget(null)} disabled={priceSaving}>
              取消
            </Button>
            <Button type="submit" variant="contained" disabled={priceSaving}>
              {priceSaving ? <CircularProgress size={24} color="inherit" /> : '保存'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* 移除菜品确认 */}
      <ConfirmDialog
        open={!!deleteItemTarget}
        title="移除菜品"
        content={deleteItemTarget ? `确定将「${deleteItemTarget.name}」从菜单移除吗？不影响已有订单。` : undefined}
        confirmText="移除"
        loading={itemDeleting}
        onConfirm={handleDeleteItem}
        onClose={() => setDeleteItemTarget(null)}
      />

      {snackbar}
    </Dialog>
  )
}
