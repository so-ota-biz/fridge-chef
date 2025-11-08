import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'eslint.config.mjs'],
  },
  ...nextVitals,
  ...nextTs,
  // Prettierとの競合を防ぐ（Prettierを優先）
  prettierConfig,
]

export default eslintConfig
