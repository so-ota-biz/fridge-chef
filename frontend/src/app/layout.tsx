'use client'

import '@mantine/core/styles.css'
import { Providers } from './providers'
import Head from 'next/head'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <Head>
        <title>FridgeChef - AI料理アシスタント</title>
        <meta name="description" content="冷蔵庫の食材から最適な料理を提案するAI料理アシスタント" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
