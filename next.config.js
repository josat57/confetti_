/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9600",
        pathname: "/uploads/**",
      },
    ],
    // Disable optimization for localhost images
    unoptimized: process.env.NODE_ENV === "development",
    // Image optimization settings
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Enable compression
  compress: true,

  // Production optimizations
  swcMinify: true,

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "react-toastify"],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Handle Leaflet properly in Next.js
    config.resolve.alias = {
      ...config.resolve.alias,
      leaflet: require.resolve("leaflet"),
    };

    // Exclude Leaflet from server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        leaflet: "leaflet",
        "react-leaflet": "react-leaflet",
      });
    }

    // Production optimizations
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
