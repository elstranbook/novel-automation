import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '12aa18f2a65e739d78fb331d14b23161.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'mockups-assets.elstranbooks.com',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'thkfjbgkuxjslvrbnpkc.supabase.co',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
