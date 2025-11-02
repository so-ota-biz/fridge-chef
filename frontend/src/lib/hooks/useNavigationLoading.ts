import { useState, useCallback, useEffect } from 'react'

/**
 * 送信成功後の画面遷移が完了するまでローディングを維持するための軽量フック。
 * - 成功時はアンマウント前提のためフラグは解除しない。
 * - 失敗時のみフラグを解除。
 * - 戻る/復元（BFCache）時は安全側で解除。
 */
export const useNavigationLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false)

  const withNavigation = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsNavigating(true)
    try {
      return await fn()
    } catch (e) {
      setIsNavigating(false)
      throw e
    }
  }, [])

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

  // フォールバック: 10秒経過で自動解除（想定外パスで残留しないための保険）
  useEffect(() => {
    if (!isNavigating) return
    const timeoutId = window.setTimeout(() => setIsNavigating(false), 10000)
    return () => window.clearTimeout(timeoutId)
  }, [isNavigating])

  return { isNavigating, withNavigation }
}
