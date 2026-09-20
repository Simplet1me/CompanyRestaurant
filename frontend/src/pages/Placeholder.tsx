import { Box, Typography } from '@mui/material'

/** 模块占位页（各模块页面开发完成前使用） */
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary">该模块待开发</Typography>
    </Box>
  )
}
