const jwt = require('jsonwebtoken')

const jwtSecret = 'EXL55h1If1V4Ivw4RDXvKTNVzck2tjtOVRtsLjU0AS8='

const anonPayload = {
  iss: 'supabase-demo',
  role: 'anon',
  exp: 1983812996,
  iat: Math.floor(Date.now() / 1000),
}

const serviceRolePayload = {
  iss: 'supabase-demo',
  role: 'service_role',
  exp: 1983812996,
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
