/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xmtp/xmtp-js'],
  webpack: (config, { isServer }) => {
    // Add WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Add polyfills for client-side only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
        'process/browser': require.resolve('process/browser'),
        util: require.resolve('util/'),
      };

      // Add WASM loader
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });

      // Add process polyfill
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );

      // Add Buffer polyfill
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Add nodeCrypto polyfill
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          nodeCrypto: 'crypto-browserify',
        })
      );
    }

    return config;
  },
  async headers() {
    return [
      {
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
};

module.exports = nextConfig; 