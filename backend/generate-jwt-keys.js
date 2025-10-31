require('dotenv').config()
const jwt = require('jsonwebtoken')

// 環境変数からJWTシークレットを取得（必須）
const jwtSecret = process.env.SUPABASE_JWT_SECRET
if (!jwtSecret) {
  throw new Error('SUPABASE_JWT_SECRET environment variable is required')
}

// 現在時刻から1年後の有効期限を設定
const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60

const anonPayload = {
  iss: 'supabase-demo',
  role: 'anon',
  exp: oneYearFromNow,
  iat: Math.floor(Date.now() / 1000),
}

const serviceRolePayload = {
  iss: 'supabase-demo',
  role: 'service_role',
  exp: oneYearFromNow,
  iat: Math.floor(Date.now() / 1000),
}

const anonKey = jwt.sign(anonPayload, jwtSecret)
const serviceRoleKey = jwt.sign(serviceRolePayload, jwtSecret)

console.log('========================================')
console.log('ANON KEY:')
console.log('========================================')
console.log(anonKey)
console.log('')
console.log('========================================')
console.log('SERVICE ROLE KEY:')
console.log('========================================')
console.log(serviceRoleKey)
console.log('')
console.log('========================================')
console.log('確認:')
console.log('Anon key length:', anonKey.length)
console.log('Service role key length:', serviceRoleKey.length)
console.log('========================================')
