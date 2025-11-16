import { NavLink, Tooltip } from '@mantine/core'
import { useRouter, usePathname } from 'next/navigation'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

export const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const implementedPages = ['/', '/ingredients', '/records']

  const navItems = [
    { label: 'トップ', icon: HomeIcon, href: '/' },
    { label: 'レシピ検索', icon: MagnifyingGlassIcon, href: '/ingredients' },
    { label: '調理記録', icon: BookOpenIcon, href: '/records' },
    { label: 'プロフィール', icon: UserCircleIcon, href: '/user/profile' },
  ]

  // パスの正規化（末尾のスラッシュを削除）
  const normalizedPathname = pathname.replace(/\/$/, '')

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const normalizedHref = item.href.replace(/\/$/, '')
        const isActive = normalizedPathname === normalizedHref
        const isImplemented = implementedPages.includes(item.href)

        const navLink = (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={<Icon style={{ width: 20, height: 20 }} />}
            active={isActive}
            onClick={() => {
              if (isImplemented) {
                router.push(item.href)
              }
            }}
            style={{
              borderRadius: 8,
              cursor: isImplemented ? 'pointer' : 'not-allowed',
              opacity: isImplemented ? 1 : 0.5,
            }}
            disabled={!isImplemented}
          />
        )

        // 未実装ページの場合はツールチップを表示
        if (!isImplemented) {
          return (
            <Tooltip key={item.href} label="準備中です" withArrow>
              {navLink}
            </Tooltip>
          )
        }

        return navLink
      })}
    </>
  )
}
