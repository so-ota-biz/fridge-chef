import '@mantine/core/styles.css'
import { Metadata } from 'next'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'FridgeChef - AI料理アシスタント',
  description: '冷蔵庫の食材から最適な料理を提案するAI料理アシスタント',
  viewport: 'width=device-width, initial-scale=1',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
