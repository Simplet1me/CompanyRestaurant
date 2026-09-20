import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login, register } from '@/api/auth'
import { useAuth } from '@/context/AuthContext'
import type { LoginParams, RegisterParams } from '@/types/auth'
import type { User } from '@/types/common'

type Mode = 'login' | 'register'

/** 登录 / 自助注册页（interfaces.md §1.1、§1.2），结构参考官方 Sign-in/Sign-up 模板 */
export default function LoginPage() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 已登录时直接进入系统
  if (user) return <Navigate to="/" replace />

  const switchMode = (next: Mode) => {
    setMode(next)
    setErrorMsg('')
  }

  /** 登录/注册共用：成功后写入登录态并跳转，失败展示后端 msg */
  const run = async (action: () => Promise<User>) => {
    setLoading(true)
    setErrorMsg('')
    try {
      setUser(await action())
      navigate('/', { replace: true })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '操作失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack
      component="main"
      direction="column"
      sx={{
        minHeight: '100vh',
        p: 2,
        justifyContent: 'center',
        alignItems: 'center',
        // 官方 Sign-in 模板风格的渐变背景
        backgroundImage:
          'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Card
        variant="outlined"
        sx={{
          p: { xs: 4, md: 5 },
          width: '100%',
          maxWidth: 450,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <RestaurantMenuIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            企业餐厅网络点餐系统
          </Typography>
        </Stack>
        <Typography component="h1" variant="h4" sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
          {mode === 'login' ? '登录' : '注册'}
        </Typography>
        {mode === 'login' ? (
          <LoginForm loading={loading} onSubmit={(params) => run(() => login(params))} />
        ) : (
          <RegisterForm loading={loading} onSubmit={(params) => run(() => register(params))} />
        )}
        {/* 官方模板的底部切换链接 */}
        <Typography align="center" variant="body2" color="text.secondary">
          {mode === 'login' ? '没有账号？' : '已有账号？'}{' '}
          <Link
            component="button"
            variant="body2"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            sx={{ alignSelf: 'center' }}
          >
            {mode === 'login' ? '自助注册' : '去登录'}
          </Link>
        </Typography>
      </Card>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

interface LoginFormProps {
  loading: boolean
  onSubmit: (params: LoginParams) => void
}

function LoginForm({ loading, onSubmit }: LoginFormProps) {
  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ loginName?: string; password?: string }>({})

  const validate = () => {
    const next: typeof errors = {}
    if (!loginName.trim()) next.loginName = '请输入登录名'
    if (!password) next.password = '请输入密码'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit({ loginName: loginName.trim(), password, rememberMe })
  }

  return (
    <Stack component="form" direction="column" spacing={2} onSubmit={handleSubmit}>
      <TextField
        label="登录名"
        value={loginName}
        onChange={(e) => setLoginName(e.target.value)}
        error={!!errors.loginName}
        helperText={errors.loginName}
        fullWidth
        autoFocus
      />
      <TextField
        label="密码"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
        fullWidth
      />
      <FormControlLabel
        control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
        label="记住我"
      />
      <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : '登录'}
      </Button>
    </Stack>
  )
}

interface RegisterFormProps {
  loading: boolean
  onSubmit: (params: RegisterParams) => void
}

const REGISTER_FIELDS = ['name', 'loginName', 'password', 'phone', 'workstation'] as const
type RegisterField = (typeof REGISTER_FIELDS)[number]

function RegisterForm({ loading, onSubmit }: RegisterFormProps) {
  const [form, setForm] = useState<RegisterParams>({
    name: '',
    loginName: '',
    password: '',
    phone: '',
    department: '',
    workstation: '',
  })
  const [errors, setErrors] = useState<Partial<Record<RegisterField, string>>>({})

  const setField = (field: keyof RegisterParams) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const next: typeof errors = {}
    for (const field of REGISTER_FIELDS) {
      if (!form[field].trim()) next[field] = '必填项'
    }
    if (form.password && (form.password.length < 6 || form.password.length > 32)) {
      next.password = '密码长度须为 6~32 位'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const { department, ...rest } = form
    onSubmit({ ...rest, department: department?.trim() || undefined })
  }

  return (
    <Stack component="form" direction="column" spacing={2} onSubmit={handleSubmit}>
      <Alert severity="info">自助注册的角色固定为「企业员工」（EMPLOYEE）</Alert>
      <TextField
        label="姓名"
        value={form.name}
        onChange={setField('name')}
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
      />
      <TextField
        label="登录名"
        value={form.loginName}
        onChange={setField('loginName')}
        error={!!errors.loginName}
        helperText={errors.loginName}
        fullWidth
      />
      <TextField
        label="密码"
        type="password"
        value={form.password}
        onChange={setField('password')}
        error={!!errors.password}
        helperText={errors.password ?? '6~32 位'}
        fullWidth
      />
      <TextField
        label="联系电话"
        value={form.phone}
        onChange={setField('phone')}
        error={!!errors.phone}
        helperText={errors.phone ?? '送餐联系用'}
        fullWidth
      />
      <TextField
        label="工作单位（部门，可选）"
        value={form.department}
        onChange={setField('department')}
        fullWidth
      />
      <TextField
        label="工位信息"
        value={form.workstation}
        onChange={setField('workstation')}
        error={!!errors.workstation}
        helperText={errors.workstation ?? '送餐用'}
        fullWidth
      />
      <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : '注册并登录'}
      </Button>
    </Stack>
  )
}
