'use client'

import '@mantine/core/styles.css'
import { useEffect } from 'react'
import { Providers } from './providers'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const title = 'FridgeChef - AI料理アシスタント'
    const description = '冷蔵庫の食材から最適な料理を提案するAI料理アシスタント'

    // Set title
    if (document.title !== title) document.title = title

    // Ensure/update meta description
    let meta = document.querySelector("meta[name='description']") as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    if (meta.getAttribute('content') !== description) {
      meta.setAttribute('content', description)
    }
  }, [])

  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
