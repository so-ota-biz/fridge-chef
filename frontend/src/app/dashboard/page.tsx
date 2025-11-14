'use client'

import { Container, Title, Text, Stack, Paper } from '@mantine/core'
import { useAuth } from '@/lib/hooks'
import { MainLayout } from '@/components/layout'

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <MainLayout>
      <Container size="md" mt="xl">
        <Stack gap="xl">
          <Title order={1}>ダッシュボード（仮）</Title>

          <Paper withBorder shadow="sm" p="xl" radius="md">
            <Stack gap="md">
              <Text size="lg" fw={500}>
                ログイン情報
              </Text>

              <div>
                <Text size="sm" c="dimmed">
                  メールアドレス
                </Text>
                <Text size="md">{user?.email}</Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  表示名
                </Text>
                <Text size="md">{user?.displayName || '未設定'}</Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  ユーザーID
                </Text>
                <Text
                  size="md"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                  }}
                >
                  {user?.id}
                </Text>
              </div>
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" c="dimmed">
              ※ これは動作確認用の仮ページです。
              <br />
              実際のダッシュボードは後ほど実装します。
            </Text>
          </Paper>
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default DashboardPage
