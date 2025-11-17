import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, Center, Loader } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAuth } from '@/lib/hooks'
import { useAuthStore } from '@/lib/store'
import { Header } from './Header'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface MainLayoutProps {
  children: ReactNode
  showNavbar?: boolean
  showFooter?: boolean
}

export const MainLayout = ({ children, showNavbar = true, showFooter = true }: MainLayoutProps) => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const isAuthRestored = useAuthStore((state) => state.isAuthRestored)
  const [opened, { toggle }] = useDisclosure()

  useEffect(() => {
    // 認証復元が完了してから認証チェックを実行
    if (isAuthRestored && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, isAuthRestored, router])

  // 認証復元中はローディング表示
  if (!isAuthRestored) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    )
  }

  // 復元完了後に未認証の場合も、リダイレクト処理中としてローディング表示
  if (!isAuthenticated) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    )
  }

  return (
    <AppShell
      header={{ height: 60 }}
      footer={
        showFooter
          ? { height: { base: '20vh', xs: '18vh', sm: '15vh', md: '12vh', lg: '10vh' } }
          : undefined
      }
      navbar={
        showNavbar
          ? {
              width: 300,
              breakpoint: 'sm',
              collapsed: { mobile: !opened },
            }
          : undefined
      }
      padding="md"
    >
      <AppShell.Header>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      {showNavbar && (
        <AppShell.Navbar p="md">
          <Navbar />
        </AppShell.Navbar>
      )}

      <AppShell.Main
        style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ flex: 1 }}>{children}</div>
      </AppShell.Main>

      {showFooter && (
        <AppShell.Footer>
          <Footer />
        </AppShell.Footer>
      )}
    </AppShell>
  )
}
