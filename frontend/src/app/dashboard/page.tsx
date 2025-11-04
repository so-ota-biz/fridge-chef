'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, Container, Title, Text, Stack, Center, Loader, Paper } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAuth } from '@/lib/hooks'
import { useAuthStore } from '@/lib/store'
import { Header } from '@/components/layout/Header'
import { Navbar } from '@/components/layout/Navbar'

const DashboardPage = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const isAuthRestored = useAuthStore((state) => state.isAuthRestored)
  const [opened, { toggle }] = useDisclosure()

  useEffect(() => {
    // 認証復元が完了してから認証チェックを実行
    if (isAuthRestored && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, isAuthRestored, router])

  // 認証復元中またはチェック中はローディング表示
  if (!isAuthRestored || !isAuthenticated) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    )
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Navbar opened={opened} />
      </AppShell.Navbar>

      <AppShell.Main>
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
                  <Text size="md" style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
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
      </AppShell.Main>
    </AppShell>
  )
}

export default DashboardPage
