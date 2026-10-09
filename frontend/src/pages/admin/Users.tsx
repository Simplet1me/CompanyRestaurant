import UploadIcon from '@mui/icons-material/Upload'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
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
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { createUser, deleteUser, listUsers, resetUserPassword, updateUser } from '@/api/user'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useSnackbar } from '@/hooks/useSnackbar'
import type { PageResult } from '@/types/common'
import type { UserItem } from '@/types/user'
import { ROLE_LABELS } from '@/utils/constants'
import { errMessage } from '@/utils/request'

/** 用户管理（interfaces.md §2）权限：MANAGER */
export default function UsersPage() {
  const { snackbar, showError, showSuccess } = useSnackbar()
  const [filters, setFilters] = useState({ keyword: '', role: '', department: '' })
  const [data, setData] = useState<PageResult<UserItem>>({ total: 0, list: [] })
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<UserItem | 'new' | null>(null)
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    listUsers({
      pageNum,
      pageSize,
      keyword: filters.keyword.trim() || undefined,
      role: filters.role || undefined,
      department: filters.department.trim() || undefined,
    })
      .then(setData)
      .catch((e) => showError(errMessage(e)))
      .finally(() => setLoading(false))
  }, [pageNum, pageSize, filters, showError])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      showSuccess('删除成功')
      setDeleteTarget(null)
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
        <Typography variant="h5">用户管理</Typography>
        <TextField
          label="姓名/登录名"
          size="small"
          value={filters.keyword}
          onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))}
          sx={{ width: 180 }}
        />
        <TextField
          select
          label="角色"
          size="small"
          value={filters.role}
          onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}
          sx={{ width: 140 }}
        >
          <MenuItem value="">全部</MenuItem>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="部门"
          size="small"
          value={filters.department}
          onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
          sx={{ width: 140 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        {/* TODO: 批量导入接口后端未实现（interfaces.md §2.7），实现后启用 */}
        <Tooltip title="批量导入后端未实现（TODO）">
          <span>
            <Button variant="outlined" size="small" startIcon={<UploadIcon />} disabled>
              批量导入
            </Button>
          </span>
        </Tooltip>
        <Button variant="contained" size="small" onClick={() => setEditing('new')}>
          新增用户
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>姓名</TableCell>
              <TableCell>登录名</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>联系电话</TableCell>
              <TableCell>部门</TableCell>
              <TableCell>工位</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.list.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.loginName}</TableCell>
                <TableCell>
                  <Chip label={ROLE_LABELS[u.role]} size="small" />
                </TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{u.department ?? '-'}</TableCell>
                <TableCell>{u.workstation ?? '-'}</TableCell>
                <TableCell>{u.createTime}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setEditing(u)}>
                    编辑
                  </Button>
                  <Button size="small" onClick={() => setResetTarget(u)}>
                    重置密码
                  </Button>
                  <Button size="small" color="error" onClick={() => setDeleteTarget(u)}>
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
        <UserFormDialog
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
      {resetTarget && (
        <ResetPasswordDialog
          key={resetTarget.id}
          userItem={resetTarget}
          onClose={() => setResetTarget(null)}
          onSaved={() => {
            setResetTarget(null)
            showSuccess('密码已重置')
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除用户"
        content={deleteTarget ? `确定删除用户「${deleteTarget.name}」吗？删除后不可恢复。` : undefined}
        confirmText="删除"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {snackbar}
    </Box>
  )
}

interface UserFormState {
  name: string
  loginName: string
  password: string
  phone: string
  department: string
  workstation: string
  role: string
}

/** 新增/编辑用户弹窗（interfaces.md §2.2/§2.4） */
function UserFormDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: UserItem | 'new'
  onClose: () => void
  onSaved: () => void
}) {
  const { snackbar, showError } = useSnackbar()
  const isCreate = editing === 'new'
  const [form, setForm] = useState<UserFormState>({
    name: isCreate ? '' : editing.name,
    loginName: isCreate ? '' : editing.loginName,
    password: '',
    phone: isCreate ? '' : editing.phone,
    department: (isCreate ? '' : editing.department) ?? '',
    workstation: isCreate ? '' : editing.workstation,
    role: isCreate ? 'EMPLOYEE' : editing.role,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const setField = (field: keyof UserFormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    const next: Record<string, string> = {}
    for (const f of ['name', 'loginName', 'phone', 'workstation'] as const) {
      if (!form[f].trim()) next[f] = '必填项'
    }
    if (isCreate && (form.password.length < 6 || form.password.length > 32)) {
      next.password = '密码长度须为 6~32 位'
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
        loginName: form.loginName.trim(),
        phone: form.phone.trim(),
        department: form.department.trim() || undefined,
        workstation: form.workstation.trim(),
        role: form.role as UserItem['role'],
      }
      if (isCreate) {
        await createUser({ ...payload, password: form.password })
      } else {
        await updateUser(editing.id, payload)
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
        <DialogTitle>{isCreate ? '新增用户' : `编辑用户：${editing.name}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="姓名" value={form.name} onChange={setField('name')} error={!!errors.name} helperText={errors.name} fullWidth required />
            <TextField label="登录名" value={form.loginName} onChange={setField('loginName')} error={!!errors.loginName} helperText={errors.loginName} fullWidth required />
            {isCreate && (
              <TextField
                label="初始密码"
                type="password"
                value={form.password}
                onChange={setField('password')}
                error={!!errors.password}
                helperText={errors.password ?? '6~32 位'}
                fullWidth
                required
              />
            )}
            <TextField label="联系电话" value={form.phone} onChange={setField('phone')} error={!!errors.phone} helperText={errors.phone} fullWidth required />
            <TextField label="工作单位（部门）" value={form.department} onChange={setField('department')} fullWidth />
            <TextField label="工位信息" value={form.workstation} onChange={setField('workstation')} error={!!errors.workstation} helperText={errors.workstation} fullWidth required />
            <TextField select label="角色" value={form.role} onChange={setField('role')} fullWidth required>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
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

/** 重置用户密码弹窗（interfaces.md §2.6） */
function ResetPasswordDialog({
  userItem,
  onClose,
  onSaved,
}: {
  userItem: UserItem
  onClose: () => void
  onSaved: () => void
}) {
  const { snackbar, showError } = useSnackbar()
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6 || newPassword.length > 32) {
      setError('密码长度须为 6~32 位')
      return
    }
    setSubmitting(true)
    try {
      await resetUserPassword(userItem.id, { newPassword })
      onSaved()
    } catch (err) {
      showError(errMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>重置密码：{userItem.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="新密码"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!error}
            helperText={error ?? '6~32 位'}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : '重置'}
          </Button>
        </DialogActions>
      </Box>
      {snackbar}
    </Dialog>
  )
}
