import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const isDesktop = process.env.BUILD_TARGET === "desktop";
const isCloudflare = process.env.BUILD_TARGET === "cloudflare";

const desktopConfig: NextConfig = {
    output: "export",
    distDir: "out-desktop",
    trailingSlash: true,
    images: { unoptimized: true },
    pageExtensions: ["tsx", "ts", "jsx", "js"],
};

const prismaDevAlias = { "@prisma/client/wasm": "@prisma/client" };

const webConfig: NextConfig = {
    pageExtensions: ["tsx", "ts", "jsx", "js", "api.ts"],
    serverExternalPackages: ["@prisma/client", ".prisma/client"],
    ...(isCloudflare ? {} : {
        turbopack: { resolveAlias: prismaDevAlias },
        webpack: (config: { resolve: { alias: Record<string, string> } }) => {
            config.resolve.alias = { ...config.resolve.alias, ...prismaDevAlias };
            return config;
        },
    }),
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,PUT,DELETE,OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Client, X-Refresh-Token" },
                    { key: "Access-Control-Max-Age", value: "86400" },
                ],
            },
        ];
    },
};

const nextConfig: NextConfig = {
    compiler: {
        styledComponents: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    ...(isDesktop ? desktopConfig : webConfig),
};

if (!isDesktop) {
    initOpenNextCloudflareForDev();
}

export default nextConfig;
