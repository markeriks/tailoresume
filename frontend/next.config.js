const { withNextVideo } = require('next-video/process');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    mdxRs: true,
  },
};

module.exports = withNextVideo(nextConfig);
