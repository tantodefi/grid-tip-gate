
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // adjust ":path*" as needed
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
    quietDeps: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
