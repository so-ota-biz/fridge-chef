import { Container, Group, Text, Anchor, Stack, Tooltip } from '@mantine/core'
import Link from 'next/link'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { href: '/about', label: 'アプリについて', implemented: false },
    { href: '/terms', label: '利用規約', implemented: false },
    { href: '/privacy', label: 'プライバシーポリシー', implemented: false },
    { href: '/contact', label: 'お問い合わせ', implemented: false },
  ]

  return (
    <Container size="xl" py="md">
      <Stack gap="sm" align="center">
        <Text size="sm" c="dimmed" ta="center">
          © {currentYear} {process.env.NEXT_PUBLIC_APP_NAME || 'FridgeChef'}. All rights reserved.
        </Text>

        <Group gap="md" justify="center">
          {footerLinks.map((link) => (
            <Tooltip key={link.href} label="準備中です" disabled={link.implemented} withArrow>
              {link.implemented ? (
                <Anchor
                  component={Link}
                  href={link.href}
                  size="sm"
                  c="dimmed"
                  style={{ textDecoration: 'none' }}
                >
                  {link.label}
                </Anchor>
              ) : (
                <Text size="sm" c="dimmed" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
                  {link.label}
                </Text>
              )}
            </Tooltip>
          ))}
        </Group>
      </Stack>
    </Container>
  )
}
