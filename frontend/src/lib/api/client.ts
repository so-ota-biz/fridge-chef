import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

const isBrowser = () => typeof window !== 'undefined'

const emitAuthExpired = () => {
  if (!isBrowser()) return
  window.dispatchEvent(new CustomEvent('auth:expired'))
}

const getStoredToken = (key: string): string | null => {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

// APIクライアントのインスタンスを作成
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30秒でタイムアウト
  headers: {
    'Content-Type': 'application/json',
  },
})

// ========================================
// リクエストインターセプター
// ========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // アクセストークンをAuthorizationヘッダーに付与
    const accessToken = getStoredToken('accessToken')
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// ========================================
// レスポンスインターセプター
// ========================================
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401エラー（認証エラー）かつ、まだリトライしていない場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      // サインインリクエスト時は401エラーでもリダイレクトしない
      const requestUrl = originalRequest.url ?? ''
      const requestPath = requestUrl.split('?')[0].split('#')[0]
      if (requestPath === '/auth/signin') {
        return Promise.reject(error)
      }

      if (!isBrowser()) {
        return Promise.reject(error)
      }

      // リトライフラグを立てる（トークンリフレッシュ後、元のリクエストが再び401を返した場合の無限ループを防ぐ）
      originalRequest._retry = true

      try {
        // リフレッシュトークンを取得
        const refreshToken = getStoredToken('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // トークンリフレッシュAPIを呼び出し
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        // 新しいトークンを保存
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // 元のリクエストのAuthorizationヘッダーを更新
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        // 元のリクエストを再実行
        return apiClient(originalRequest)
      } catch (refreshError) {
        // リフレッシュ失敗時はローカルストレージをクリアしてログアウト誘導
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        emitAuthExpired()
        return Promise.reject(refreshError)
      }
    }

    // 401以外のエラー: バックエンドのメッセージがあれば差し替えて返す
    try {
      const data = (error.response?.data ?? {}) as { message?: string | string[]; error?: string }
      let backendMessage: string | undefined
      if (typeof data.message === 'string') backendMessage = data.message
      else if (Array.isArray(data.message) && data.message.length > 0)
        backendMessage = data.message[0]
      else if (typeof data.error === 'string') backendMessage = data.error

      if (backendMessage) {
        error.message = backendMessage
      }
    } catch {
      // 解析に失敗した場合は何もしない（既定のメッセージを利用）
    }

    return Promise.reject(error)
  },
)

export { apiClient }
