import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import type { ChangeEvent, FormEvent } from 'react'
import { batchDeleteRecipes, createRecipe, deleteRecipe, listRecipes, updateRecipe } from '@/api/recipe'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { PageResult } from '@/types/common'
import type { Recipe } from '@/types/recipe'
import { formatMoney } from '@/utils/format'
import { errMessage } from '@/utils/request'

/** 食谱管理（interfaces.md §4）权限：MANAGER、CHEF */
export default function RecipesPage() {
  const { snackbar, showError, showSuccess } = useSnackbar()
  const [filters, setFilters] = useState({ keyword: '', classify: '' })
  const [data, setData] = useState<PageResult<Recipe>>({ total: 0, list: [] })
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [editing, setEditing] = useState<Recipe | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null)
  const [batchOpen, setBatchOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    listRecipes({
      pageNum,
      pageSize,
      keyword: filters.keyword.trim() || undefined,
      classify: filters.classify.trim() || undefined,
    })
      .then((res) => {
        setData(res)
        // 翻页/筛选后清空选中
        setSelected([])
      })
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [pageNum, pageSize, filters, showError])

  useEffect(() => {
    load()
  }, [load])

  const toggleOne = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const toggleAll = () => {
    const ids = data.list.map((r) => r.id)
    setSelected(selected.length === ids.length ? [] : ids)
  }

  const handleDeleteOne = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteRecipe(deleteTarget.id)
      showSuccess('删除成功')
      setDeleteTarget(null)
      load()
    } catch (e) {
      showError(errMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  const handleBatchDelete = async () => {
    setDeleting(true)
    try {
      await batchDeleteRecipes({ ids: selected })
      showSuccess(`已删除 ${selected.length} 个菜品`)
      setBatchOpen(false)
      load()
    } catch (e) {
      showError(errMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">食谱管理</Typography>
        <TextField
          label="菜名"
          size="small"
          value={filters.keyword}
          onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))}
          sx={{ width: 160 }}
        />
        <TextField
          label="分类"
          size="small"
          value={filters.classify}
          onChange={(e) => setFilters((p) => ({ ...p, classify: e.target.value }))}
          sx={{ width: 120 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          size="small"
          color="error"
          disabled={selected.length === 0}
          onClick={() => setBatchOpen(true)}
        >
          批量删除{selected.length > 0 ? `（${selected.length}）` : ''}
        </Button>
        <Button variant="contained" size="small" onClick={() => setEditing('new')}>
          新增菜品
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={data.list.length > 0 && selected.length === data.list.length}
                  indeterminate={selected.length > 0 && selected.length < data.list.length}
                  onChange={toggleAll}
                />
              </TableCell>
              <TableCell>图片</TableCell>
              <TableCell>菜名</TableCell>
              <TableCell>分类</TableCell>
              <TableCell>单位</TableCell>
              <TableCell>价格</TableCell>
              <TableCell>更新时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.list.map((r) => (
              <TableRow key={r.id} hover selected={selected.includes(r.id)}>
                <TableCell padding="checkbox">
                  <Checkbox checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} />
                </TableCell>
                <TableCell>
                  <RecipePhoto photo={r.photo} name={r.name} />
                </TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.classify}</TableCell>
                <TableCell>{r.unit}</TableCell>
                <TableCell>{formatMoney(r.price)}</TableCell>
                <TableCell>{r.updateTime}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setEditing(r)}>
                    编辑
                  </Button>
                  <Button size="small" color="error" onClick={() => setDeleteTarget(r)}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && data.list.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  暂无数据
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

      {editing && (
        <RecipeFormDialog
          key={editing === 'new' ? 'new' : editing.id}
          editing={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            showSuccess(editing === 'new' ? '新增成功' : '保存成功')
            load()
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除菜品"
        content={deleteTarget ? `确定删除「${deleteTarget.name}」吗？不影响已有菜单与订单。` : undefined}
        confirmText="删除"
        loading={deleting}
        onConfirm={handleDeleteOne}
        onClose={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={batchOpen}
        title="批量删除菜品"
        content={`确定删除选中的 ${selected.length} 个菜品吗？不影响已有菜单与订单。`}
        confirmText="删除"
        loading={deleting}
        onConfirm={handleBatchDelete}
        onClose={() => setBatchOpen(false)}
      />

      {snackbar}
    </Box>
  )
}

/** 菜品缩略图（无图或加载失败时显示占位图标） */
function RecipePhoto({ photo, name }: { photo?: string; name: string }) {
  const [imgError, setImgError] = useState(false)
  if (!photo || imgError) {
    return (
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RestaurantMenuIcon sx={{ color: 'text.disabled' }} fontSize="small" />
      </Box>
    )
  }
  return (
    <Box
      component="img"
      src={photo}
      alt={name}
      onError={() => setImgError(true)}
      sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }}
    />
  )
}

interface RecipeFormState {
  name: string
  unit: string
  classify: string
  price: string
  photo: string
}

/** 新增/编辑菜品弹窗（interfaces.md §4.2/§4.4） */
function RecipeFormDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: Recipe | 'new'
  onClose: () => void
  onSaved: () => void
}) {
  const { snackbar, showError } = useSnackbar()
  const isCreate = editing === 'new'
  const [form, setForm] = useState<RecipeFormState>({
    name: isCreate ? '' : editing.name,
    unit: isCreate ? '' : editing.unit,
    classify: isCreate ? '' : editing.classify,
    price: isCreate ? '' : String(editing.price),
    photo: (isCreate ? '' : editing.photo) ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const setField = (field: keyof RecipeFormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    const next: Record<string, string> = {}
    for (const f of ['name', 'unit', 'classify', 'price'] as const) {
      if (!form[f].trim()) next[f] = '必填项'
    }
    const price = parseFloat(form.price)
    if (form.price.trim() && (Number.isNaN(price) || price <= 0)) {
      next.price = '价格须为大于 0 的数字（两位小数）'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        unit: form.unit.trim(),
        classify: form.classify.trim(),
        price: Math.round(parseFloat(form.price) * 100) / 100,
        photo: form.photo.trim() || undefined,
      }
      if (isCreate) {
        await createRecipe(payload)
      } else {
        await updateRecipe(editing.id, payload)
      }
      onSaved()
    } catch (err) {
      showError(errMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isCreate ? '新增菜品' : `编辑菜品：${editing.name}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="菜名" value={form.name} onChange={setField('name')} error={!!errors.name} helperText={errors.name} fullWidth required />
            <Stack direction="row" spacing={2}>
              <TextField label="分类" value={form.classify} onChange={setField('classify')} error={!!errors.classify} helperText={errors.classify ?? '如：主食/糕点/菜肴/甜点'} fullWidth required />
              <TextField label="计量单位" value={form.unit} onChange={setField('unit')} error={!!errors.unit} helperText={errors.unit ?? '如：份/两/个/杯'} fullWidth required />
            </Stack>
            <TextField
              label="单位价格（元）"
              type="number"
              value={form.price}
              onChange={setField('price')}
              error={!!errors.price}
              helperText={errors.price}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
              fullWidth
              required
            />
            {/* TODO: 图片上传接口后端未实现（interfaces.md §3.1），实现后改为上传组件 */}
            <TextField
              label="菜品图片 URL（选填）"
              value={form.photo}
              onChange={setField('photo')}
              helperText="图片上传后端未实现，暂可填写图片 URL"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : '保存'}
          </Button>
        </DialogActions>
      </Box>
      {snackbar}
    </Dialog>
  )
}
