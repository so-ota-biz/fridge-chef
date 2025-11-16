'use client'

import { Grid } from '@mantine/core'
import { RecordCard } from '@/components/record/RecordCard'
import type { Record } from '@/types/record'

interface RecordListProps {
  records: Record[]
}

/**
 * 調理記録一覧コンポーネント
 */
export const RecordList = ({ records }: RecordListProps) => {
  return (
    <Grid gutter="lg">
      {records.map((record) => (
        <Grid.Col key={record.id} span={{ base: 12, sm: 6, md: 4 }}>
          <RecordCard record={record} />
        </Grid.Col>
      ))}
    </Grid>
  )
}
