'use client'

import { useState, useEffect } from 'react'
import { signUp, signIn, logout, initializeCsrf } from '@/lib/api/auth'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/useAuth'

export default function AuthTestPage() {
  const { user, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('Test User')
  const [message, setMessage] = useState('')
  const [cookies, setCookies] = useState<Record<string, string>>({})
  const [testResponse, setTestResponse] = useState('')

  // Cookieの状態を更新
  const refreshCookieStatus = () => {
    const cookieObj: Record<string, string> = {}
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key) cookieObj[key] = value || ''
    })
    setCookies(cookieObj)
  }

  useEffect(() => {
    // 初回実行は次のtickで実行してwarningを回避
    const timer = setTimeout(refreshCookieStatus, 0)
    const interval = setInterval(refreshCookieStatus, 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  const handleSignUp = async () => {
    try {
      await signUp({ email, password, name })
      setMessage('✅ サインアップ成功')
      refreshCookieStatus()
    } catch (error) {
      setMessage(`❌ サインアップ失敗: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  const handleSignIn = async () => {
    try {
      await signIn({ email, password })
      setMessage('✅ サインイン成功')
      refreshCookieStatus()
    } catch (error) {
      setMessage(`❌ サインイン失敗: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setMessage('✅ ログアウト成功')
      refreshCookieStatus()
    } catch (error) {
      setMessage(`❌ ログアウト失敗: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  const handleInitCsrf = async () => {
    try {
      await initializeCsrf()
      setMessage('✅ CSRFトークン初期化成功')
      refreshCookieStatus()
    } catch (error) {
      setMessage(`❌ CSRFトークン初期化失敗: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  const handleTestPost = async () => {
    try {
      const response = await apiClient.post('/test/post', { message: 'Test POST request' })
      setTestResponse(`✅ POST成功: ${JSON.stringify(response.data)}`)
      setMessage('✅ テストPOST成功')
    } catch (error) {
      setTestResponse(`❌ POST失敗: ${error instanceof Error ? error.message : '不明なエラー'}`)
      setMessage(`❌ テストPOST失敗: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  const handleClearCookies = () => {
    document.cookie.split(';').forEach((c) => {
      const eqPos = c.indexOf('=')
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim()
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    })
    setMessage('🗑️ 全Cookie削除')
    refreshCookieStatus()
  }

  const handleClearLocalStorage = () => {
    localStorage.clear()
    setMessage('🗑️ LocalStorage削除')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 認証テストページ</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側: 認証操作 */}
          <div className="space-y-6">
            {/* 認証状態 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">認証状態</h2>
              <div className="space-y-2">
                <p>
                  <strong>ログイン状態:</strong>{' '}
                  <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                    {isAuthenticated ? '✅ ログイン中' : '❌ 未ログイン'}
                  </span>
                </p>
                {user && (
                  <>
                    <p>
                      <strong>ユーザー名:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* サインアップ/サインイン */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">認証操作</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <div className="flex gap-2">
                  <button onClick={handleSignUp} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    サインアップ
                  </button>
                  <button onClick={handleSignIn} className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    サインイン
                  </button>
                </div>
                <button onClick={handleLogout} className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  ログアウト
                </button>
              </div>
            </div>

            {/* テストアクション */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">テストアクション</h2>
              <div className="space-y-2">
                <button onClick={handleInitCsrf} className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  CSRFトークン初期化
                </button>
                <button onClick={handleTestPost} className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                  テストPOSTリクエスト
                </button>
                <button onClick={handleClearCookies} className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                  全Cookie削除
                </button>
                <button
                  onClick={handleClearLocalStorage}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  LocalStorage削除
                </button>
              </div>
              {testResponse && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <pre className="text-sm whitespace-pre-wrap">{testResponse}</pre>
                </div>
              )}
            </div>

            {/* メッセージ */}
            {message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm">{message}</p>
              </div>
            )}
          </div>

          {/* 右側: Cookie/LocalStorage状態 */}
          <div className="space-y-6">
            {/* Cookie状態 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cookie状態</h2>
              <div className="space-y-2">
                {Object.keys(cookies).length === 0 ? (
                  <p className="text-gray-500">Cookieなし</p>
                ) : (
                  Object.entries(cookies).map(([key, value]) => (
                    <div key={key} className="border-b pb-2">
                      <p className="font-mono text-sm">
                        <strong>{key}:</strong>{' '}
                        <span className="text-gray-600">{value.substring(0, 50)}{value.length > 50 ? '...' : ''}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LocalStorage状態 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">LocalStorage状態</h2>
              <div className="space-y-2">
                {typeof window !== 'undefined' && localStorage.length === 0 ? (
                  <p className="text-gray-500">LocalStorageなし</p>
                ) : (
                  typeof window !== 'undefined' &&
                  Object.entries(localStorage).map(([key, value]) => (
                    <div key={key} className="border-b pb-2">
                      <p className="font-mono text-sm">
                        <strong>{key}:</strong>
                      </p>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap mt-1">{value}</pre>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* テストシナリオ */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">📝 テストシナリオ</h2>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">基本フロー:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>CSRFトークン初期化</li>
                  <li>サインアップ/サインイン</li>
                  <li>Cookie確認 (accessToken, refreshToken, csrfToken)</li>
                  <li>テストPOSTリクエスト</li>
                  <li>ログアウト</li>
                </ol>

                <p className="font-semibold mt-4">期限切れテスト:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>環境変数でトークン期限を2分に設定</li>
                  <li>サインイン後、2分待機</li>
                  <li>テストPOSTで自動リフレッシュ確認</li>
                </ol>

                <p className="font-semibold mt-4">CSRF復旧テスト:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>サインイン</li>
                  <li>全Cookie削除ボタンをクリック</li>
                  <li>テストPOSTで復旧フロー確認</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
