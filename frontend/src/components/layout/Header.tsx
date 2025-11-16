import { Group, Burger, UnstyledButton, Menu, Avatar, Text, rem, Tooltip } from '@mantine/core'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserCircleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth, useSignOut } from '@/lib/hooks'

interface HeaderProps {
  opened: boolean
  toggle: () => void
}

export const Header = ({ opened, toggle }: HeaderProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut()
  }

  const navItems = [
    { label: 'トップ', href: '/', icon: '🏠' },
    { label: 'レシピ検索', href: '/ingredients', icon: '🔍' },
    { label: '調理記録', href: '/records', icon: '📚' },
  ]

  // 実装済みページのリスト
  const implementedPages = ['/', '/ingredients', '/records']
  const isProfileImplemented = implementedPages.includes('/user/profile')

  return (
    <Group h="100%" px="md" justify="space-between">
      {/* 左側: ハンバーガーメニュー + ロゴ */}
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <UnstyledButton component={Link} href="/">
          <Text size="xl" fw={700} c="orange">
            {process.env.NEXT_PUBLIC_APP_NAME || 'FridgeChef'}
          </Text>
        </UnstyledButton>
      </Group>

      {/* 中央: デスクトップ用ナビゲーション */}
      <Group gap="md" visibleFrom="sm">
        {navItems.map((item) => (
          <UnstyledButton
            key={item.href}
            onClick={() => router.push(item.href)}
            style={{
              fontWeight: pathname === item.href ? 600 : 400,
              color: pathname === item.href ? 'var(--mantine-color-blue-6)' : 'inherit',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
          >
            <Text size="sm">
              {item.icon} {item.label}
            </Text>
          </UnstyledButton>
        ))}
      </Group>

      {/* 右側: ユーザーメニュー */}
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <UnstyledButton>
            <Group gap="sm">
              <Avatar
                src={user?.avatarUrl}
                alt={user?.displayName ?? user?.email ?? ''}
                radius="xl"
                size="md"
              />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {user?.displayName || 'ユーザー'}
                </Text>
                <Text size="xs" c="dimmed">
                  {user?.email}
                </Text>
              </div>
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Tooltip label="準備中です" withArrow disabled={isProfileImplemented} position="left">
            <Menu.Item
              leftSection={<UserCircleIcon style={{ width: rem(16), height: rem(16) }} />}
              onClick={(e) => {
                if (isProfileImplemented) {
                  router.push('/user/profile')
                } else {
                  e.preventDefault()
                }
              }}
              style={{
                cursor: isProfileImplemented ? 'pointer' : 'not-allowed',
                opacity: isProfileImplemented ? 1 : 0.5,
              }}
            >
              プロフィール
            </Menu.Item>
          </Tooltip>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={
              <ArrowRightStartOnRectangleIcon style={{ width: rem(16), height: rem(16) }} />
            }
            onClick={handleSignOut}
          >
            ログアウト
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}
