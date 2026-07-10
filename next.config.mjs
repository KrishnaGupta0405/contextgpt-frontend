import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  pageExtensions: ['js', 'jsx', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.magicui.design',
      },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
