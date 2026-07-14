import type { NextConfig } from 'next'
import path from 'path'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  transpilePackages: ['@furbase/db'],
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    // Images are pre-resized/compressed before being bundled or uploaded (see
    // packages/db/src/seed.ts and the upload route), so the extra on-demand
    // server-side optimization isn't needed — and is too CPU-heavy for
    // Render's free tier, where it noticeably slows down first image loads.
    unoptimized: true,
  },
}

export default withNextIntl(nextConfig)
