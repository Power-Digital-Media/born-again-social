import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "checkinsandreviews.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "www.bornagainroofing.com",
      },
      {
        protocol: "https",
        hostname: "bornagainroofing.com",
      },
    ],
  },
};

export default nextConfig;
