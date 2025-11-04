import { NavLink } from '@mantine/core'
import { useRouter, usePathname } from 'next/navigation'
import { HomeIcon, ArchiveBoxIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface NavbarProps {
  opened: boolean
}

export const Navbar = ({ opened }: NavbarProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      label: 'ダッシュボード',
      icon: HomeIcon,
      href: '/dashboard',
    },
    {
      label: 'アーカイブ',
      icon: ArchiveBoxIcon,
      href: '/archive',
    },
    {
      label: 'プロフィール',
      icon: UserCircleIcon,
      href: '/user/profile',
    },
  ]

  // パスの正規化（末尾のスラッシュを削除）
  const normalizedPathname = pathname.replace(/\/$/, '')

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const normalizedHref = item.href.replace(/\/$/, '')
        const isActive = normalizedPathname === normalizedHref

        return (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={<Icon style={{ width: 20, height: 20 }} />}
            active={isActive}
            onClick={() => router.push(item.href)}
            style={{ borderRadius: 8 }}
          />
        )
      })}
    </>
  )
}
