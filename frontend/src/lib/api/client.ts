import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

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
    // ローカルストレージからアクセストークンを取得
    const token = localStorage.getItem('accessToken')

    // トークンが存在する場合、Authorizationヘッダーに追加
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// ========================================
// レスポンスインターセプター
// ========================================
apiClient.interceptors.response.use(
  (response) => {
    // 正常なレスポンスはそのまま返す
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401エラー（認証エラー）かつ、まだリトライしていない場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      // サインインリクエスト時は401エラーでもリダイレクトしない
      if (originalRequest.url?.includes('/auth/signin')) {
        return Promise.reject(error)
      }

      // リトライフラグを立てる（トークンリフレッシュ後、元のリクエストが再び401を返した場合の無限ループを防ぐ）
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        // リフレッシュトークンがない場合はログアウト処理
        if (!refreshToken) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/auth/signin'
          return Promise.reject(error)
        }

        // トークンリフレッシュAPIを呼び出し（無限ループを防ぐため、apiClientは使わない）
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        // 新しいトークンをローカルストレージに保存
        localStorage.setItem('accessToken', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        // 元のリクエストのAuthorizationヘッダーを更新
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        // 元のリクエストを再実行
        return apiClient(originalRequest)
      } catch (refreshError) {
        // リフレッシュ失敗時はログアウト
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/auth/signin'
        return Promise.reject(refreshError)
      }
    }

    // 401以外のエラー: バックエンドのメッセージがあれば差し替えて返す
    try {
      const data = (error.response?.data ?? {}) as { message?: string | string[]; error?: string }
      let backendMessage: string | undefined
      if (typeof data.message === 'string') backendMessage = data.message
      else if (Array.isArray(data.message) && data.message.length > 0) backendMessage = data.message[0]
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
