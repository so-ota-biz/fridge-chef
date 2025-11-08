'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * 送信成功後の画面遷移が完了するまでローディングを維持するための軽量フック。
 * - 成功時はアンマウント前提のためフラグは解除しない。
 * - 失敗時のみフラグを解除。
 * - 戻る/復元（BFCache）時は安全側で解除。
 */
export const useNavigationLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const stopNavigating = useCallback(() => {
    if (isMountedRef.current) {
      setIsNavigating(false)
    }
  }, [])

  const withNavigation = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsNavigating(true)
    try {
      return await fn()
    } finally {
      stopNavigating()
    }
  }, [stopNavigating])

  useEffect(() => {
    const handlePopState = () => setIsNavigating(false)
    const handlePageShow = () => setIsNavigating(false)

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  return { isNavigating, withNavigation }
}
