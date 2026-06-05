import nextConfig from 'eslint-config-next'
import prettierConfig from 'eslint-config-prettier'

const config = [
  { ignores: ['coverage/**', '.next/**'] },
  ...nextConfig,
  prettierConfig,
]

export default config
