import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  pageExtensions: ['js', 'jsx', 'mdx'],
  allowedDevOrigins: ['*.trycloudflare.com'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.magicui.design',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: '**.giphy.com',
      },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
