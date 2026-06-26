import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.NEXT_PUBLIC_API_PROXY_TARGET ?? "http://localhost:5009";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiProxyTarget}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
