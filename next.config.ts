import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api");
const isLocalApi = ["localhost", "127.0.0.1", "::1"].includes(apiUrl.hostname);

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/media/**",
      },
    ],
    dangerouslyAllowLocalIP: isLocalApi,
  },
};

export default withNextIntl(nextConfig);
