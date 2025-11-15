import { Group, Burger, UnstyledButton, Menu, Avatar, Text, rem } from '@mantine/core'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserCircleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth, useSignOut } from '@/lib/hooks'

interface HeaderProps {
  opened: boolean
  toggle: () => void
}

export const Header = ({ opened, toggle }: HeaderProps) => {
  const router = useRouter()
  const { user } = useAuth()
  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut()
  }

  const display = user?.displayName?.trim()
  const alt = display && display.length > 0 ? display : (user?.email ?? '')

  return (
    <Group h="100%" px="md" justify="space-between">
      {/* 左側: ハンバーガーメニュー + ロゴ */}
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <UnstyledButton component={Link} href="/dashboard">
          <Text size="xl" fw={700} c="orange">
            {process.env.NEXT_PUBLIC_APP_NAME || 'FridgeChef'}
          </Text>
        </UnstyledButton>
      </Group>

      {/* 右側: ユーザーメニュー */}
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <UnstyledButton>
            <Group gap="sm">
              <Avatar
                src={user?.avatarUrl}
                alt={alt}
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
          <Menu.Item
            leftSection={<UserCircleIcon style={{ width: rem(16), height: rem(16) }} />}
            onClick={() => router.push('/user/profile')}
          >
            プロフィール
          </Menu.Item>
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
