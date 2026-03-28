/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 忽略 TypeScript 檢查
    ignoreBuildErrors: true,
  },
  eslint: {
    // 忽略 ESLint 檢查
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
