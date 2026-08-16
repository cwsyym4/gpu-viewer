/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  // removed typescript.ignoreBuildErrors and eslint.ignoreDuringBuilds – now strict
  experimental: { cpus: 1 },
}
export default nextConfig
