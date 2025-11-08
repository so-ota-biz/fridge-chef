import { Container, Group, Text, Anchor, Stack } from '@mantine/core'
import Link from 'next/link'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Container size="xl" py="md">
      <Stack gap="sm" align="center">
        {/* コピーライト */}
        <Text size="sm" c="dimmed" ta="center">
          © {currentYear} {process.env.NEXT_PUBLIC_APP_NAME || 'FridgeChef'}. All rights reserved.
        </Text>

        {/* リンク */}
        <Group gap="md" justify="center">
          <Anchor component={Link} href="/about" size="sm" c="dimmed">
            アプリについて
          </Anchor>
          <Anchor component={Link} href="/terms" size="sm" c="dimmed">
            利用規約
          </Anchor>
          <Anchor component={Link} href="/privacy" size="sm" c="dimmed">
            プライバシーポリシー
          </Anchor>
          <Anchor component={Link} href="/contact" size="sm" c="dimmed">
            お問い合わせ
          </Anchor>
        </Group>
      </Stack>
    </Container>
  )
}
