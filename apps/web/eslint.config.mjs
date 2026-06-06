import nextConfig from 'eslint-config-next'
import prettierConfig from 'eslint-config-prettier'

const config = [
  { ignores: ['coverage/**', '.next/**', 'e2e/**'] },
  ...nextConfig,
  prettierConfig,
]

export default config
