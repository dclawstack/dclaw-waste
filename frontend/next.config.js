/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://dclaw-waste-backend:8000/:path*' }
    ];
  }
};
module.exports = nextConfig;
