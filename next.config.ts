import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
);
const isLocalApi = ["localhost", "127.0.0.1", "::1"].includes(apiUrl.hostname);

const mediaPattern = (hostname: string) => ({
  protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
  hostname,
  port: apiUrl.port,
  pathname: "/media/**",
});

// Media URLs are built by the backend from the request Host, which may be
// either localhost or 127.0.0.1 in development, so allow both for a local API.
const remotePatterns = isLocalApi
  ? [mediaPattern("localhost"), mediaPattern("127.0.0.1")]
  : [mediaPattern(apiUrl.hostname)];

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90],
    remotePatterns,
    dangerouslyAllowLocalIP: isLocalApi,
  },
};

export default withNextIntl(nextConfig);
