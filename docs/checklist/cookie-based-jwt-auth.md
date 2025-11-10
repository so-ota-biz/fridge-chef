Cookie ベース JWT 認証（ダブルサブミット）完全動作確認チェックリスト

📋 テスト環境セットアップ

- Chrome 開発者ツールを開く
- Application > Storage > Cookies で localhost:3001 を確認
- Network タブでリクエスト・レスポンス監視を開始
- Console タブでエラー・ログ監視を開始

---

🔄 基本認証フロー

1. 初回アクセス・CSRF 初期化

操作: ブラウザでアプリにアクセス
確認点:

- Network: /auth/csrf または /auth/me の GET リクエストが発生
- Cookies: csrfToken が設定される（HttpOnly: false）
- Cookies: accessToken, refreshToken は未設定
- Application: LocalStorage に auth-storage が存在（user: null）

2. サインアップ

操作: 新規ユーザー登録
確認点:

- Network: POST /auth/signup に CSRF ヘッダーなし
- Response: 成功時、ユーザー情報のみ返却
- Cookies: トークン関連は未設定のまま
- Redirect: サインインページに遷移

3. サインイン

操作: ユーザーでログイン
確認点:

- Network: POST /auth/signin に CSRF ヘッダーなし
- Response: ユーザー情報のみ（トークンは含まれない）
- Cookies: accessToken（HttpOnly: true, maxAge: 15 分）
- Cookies: refreshToken（HttpOnly: true, maxAge: 7 日）
- Cookies: csrfToken（HttpOnly: false, 新しい値）
- LocalStorage: auth-storage にユーザー情報保存
- Redirect: ダッシュボードに遷移

---

🔒 CSRF 保護確認

4. 認証が必要な API 呼び出し

操作: ダッシュボードで何らかのデータ取得
確認点:

- Network: GET リクエストに CSRF ヘッダーなし
- Network: Cookie: accessToken=... が自動送信
- Response: 正常にデータ取得

5. 状態変更 API（POST/PUT/DELETE）

操作: データの作成・更新・削除操作
確認点:

- Network: X-CSRF-Token ヘッダーが自動付与
- Network: ヘッダー値が Cookie の csrfToken と一致
- Response: 正常に処理完了

---

🔄 トークンリフレッシュ

6. 手動リフレッシュ（任意）

操作: 開発者ツールで /auth/refresh を手動実行
確認点:

- Request: X-CSRF-Token ヘッダー必須
- Response: {"ok": true}
- Cookies: 新しい accessToken, refreshToken
- Cookies: 新しい csrfToken

7. 自動リフレッシュ（401 エラー発生時）

操作: アクセストークンが期限切れになる状況を作る
// Console で実行してアクセストークンを削除
document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
その後、認証が必要な API を呼び出す

確認点:

- Network: 最初の API で 401 エラー
- Network: 自動的に POST /auth/refresh
- Network: リフレッシュ成功後、元の API が再実行
- Cookies: 新しいトークンセット
- UI: ユーザーには何も見えずに継続動作

---

🚪 ログアウト

8. 正常ログアウト

操作: ログアウトボタンをクリック
確認点:

- Network: POST /auth/logout に CSRF ヘッダー
- Response: 204 No Content
- Cookies: 全認証関連 Cookie 削除
- LocalStorage: auth-storage クリア（user: null）
- Redirect: サインインページに遷移

9. セッション期限切れ

操作: リフレッシュトークンも期限切れの状況
// Console で実行してすべてのトークンを削除
document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
その後、認証が必要な API を呼び出す

確認点:

- Network: リフレッシュ試行で 401 エラー
- Console: auth:expired イベント発火
- LocalStorage: 自動的にクリア
- Redirect: サインインページに自動遷移

---

🛡️ セキュリティチェック

10. CSRF 攻撃耐性

操作: 開発者ツールで CSRF トークンを意図的に変更
// Console で実行
document.cookie = 'csrfToken=fake-token; path=/;';
その後、POST/PUT/DELETE 操作を実行

確認点:

- Network: X-CSRF-Token は古い（正しくない）値
- Response: 401 Unauthorized（CSRF validation failed）
- UI: 操作が拒否される

11. Cookie 設定確認

操作: Application > Cookies で詳細設定を確認
確認点:

- accessToken: HttpOnly=true, Secure=環境依存, SameSite=lax/none
- refreshToken: HttpOnly=true, Secure=環境依存, SameSite=lax/none
- csrfToken: HttpOnly=false, Secure=環境依存, SameSite=lax/none

12. XSS 攻撃耐性

操作: Console で JavaScript によるトークンアクセス試行
// Console で実行
console.log('Access Token:', document.cookie.includes('accessToken'));
console.log('Refresh Token:', document.cookie.includes('refreshToken'));
console.log('CSRF Token accessible:', document.cookie.match(/csrfToken=([^;]+)/));

確認点:

- Console: accessToken、refreshToken は JavaScript から読み取り不可
- Console: csrfToken のみ読み取り可能
- 意図的な設計通りの動作

---

🌐 ブラウザ横断チェック

13. 複数タブでの同期

操作: 同一ブラウザで複数タブを開いてログイン状態確認
確認点:

- 一方のタブでログイン → 他のタブも認証状態同期
- 一方のタブでログアウト → 他のタブも未認証状態同期

14. ブラウザ再起動

操作: ブラウザを完全に閉じて再起動、アプリアクセス
確認点:

- Network: GET /auth/me で認証状態復元試行
- Cookies: リフレッシュトークンが有効なら認証維持
- UI: 適切な認証状態で画面表示

---

✅ 完了判定

すべての項目が ✅ なら、Cookie ベース JWT 認証（ダブルサブミット）の実装は完了

最終確認項目:

- CSRF トークンが適切に初期化・ローテーション
- トークンが HttpOnly で保護され JavaScript から隠蔽
- 自動リフレッシュが透明に動作
- セキュリティ攻撃（CSRF、XSS）に対する適切な防御
- ユーザーエクスペリエンスが阻害されない
