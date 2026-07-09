/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Add any other Next.js config here
}

module.exports = withBundleAnalyzer(nextConfig)
