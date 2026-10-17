import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useState } from 'react'
import { downloadExcel, importUsers } from '@/api/file'
import type { ImportResult } from '@/api/file'
import { errMessage } from '@/utils/request'

export default function UserImportDialog({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const submit = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const imported = await importUsers(file)
      setResult(imported)
      setFile(null)
      onImported()
    } catch (e) { setError(errMessage(e)) }
    finally { setBusy(false) }
  }
  const template = async () => {
    setDownloading(true)
    setError('')
    try { await downloadExcel('/users/import/template', '用户批量导入模板') }
    catch (e) { setError(errMessage(e)) }
    finally { setDownloading(false) }
  }
  return (
    <Dialog open onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>批量导入用户</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">先下载模板，将用户填写到“用户数据”工作表。模板内附单个用户示例，示例不会被导入。成功行直接保存，失败行修正后可单独重新导入。</Alert>
          <Box><Button variant="outlined" onClick={template} disabled={downloading}>{downloading ? '下载中…' : '下载 Excel 模板（含示例）'}</Button></Box>
          <Typography variant="body2">支持 .xlsx / .xls，最大 10MB，每次最多 1000 行；除部门外均必填。</Typography>
          <Box>
            <Button component="label" variant="outlined" disabled={busy}>
              选择 Excel 文件
              <input hidden type="file" accept=".xlsx,.xls" onChange={(e) => {
                const selected = e.target.files?.[0]
                e.target.value = ''
                if (!selected) return
                setResult(null)
                if (!/\.(xlsx|xls)$/i.test(selected.name) || selected.size > 10 * 1024 * 1024) {
                  setError('请选择不超过10MB的xlsx或xls文件'); setFile(null); return
                }
                setError(''); setFile(selected)
              }} />
            </Button>
            <Typography component="span" sx={{ ml: 2 }}>{file?.name ?? '尚未选择文件'}</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {result && <>
            <Alert severity={result.failureCount ? 'warning' : 'success'}>成功 {result.successCount} 人，失败 {result.failureCount} 人</Alert>
            {result.failures.length > 0 && <Table size="small"><TableHead><TableRow><TableCell>Excel 行号</TableCell><TableCell>失败原因</TableCell></TableRow></TableHead><TableBody>{result.failures.map((failure) => <TableRow key={failure.row}><TableCell>{failure.row}</TableCell><TableCell>{failure.reason}</TableCell></TableRow>)}</TableBody></Table>}
          </>}
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={busy}>关闭</Button><Button variant="contained" onClick={submit} disabled={!file || busy}>{busy ? '正在导入…' : '开始导入'}</Button></DialogActions>
    </Dialog>
  )
}
