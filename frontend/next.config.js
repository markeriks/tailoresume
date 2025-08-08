const { withNextVideo } = require('next-video/process');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

module.exports = withNextVideo(nextConfig);