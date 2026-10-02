import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { readFileSync } from "node:fs";

// 설정 > 정보 탭이 보여주는 버전. package.json 하나가 출처다 (Cargo.toml·tauri.conf.json 과 같이 올린다).
const APP_VERSION = (JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string }).version;

const isDesktop = process.env.BUILD_TARGET === "desktop";
const isCloudflare = process.env.BUILD_TARGET === "cloudflare";

const desktopConfig: NextConfig = {
    env: { NEXT_PUBLIC_APP_VERSION: APP_VERSION },
    output: "export",
    distDir: "out-desktop",
    trailingSlash: true,
    images: { unoptimized: true },
    pageExtensions: ["tsx", "ts", "jsx", "js"],
};

const prismaDevAlias = { "@prisma/client/wasm": "@prisma/client" };

const webConfig: NextConfig = {
    env: { NEXT_PUBLIC_APP_VERSION: APP_VERSION },
    pageExtensions: ["tsx", "ts", "jsx", "js", "api.ts"],
    ...(isCloudflare ? {
        serverExternalPackages: ["@prisma/client", ".prisma/client"],
    } : {
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
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Client, X-Refresh-Token, X-Cronos-Platform" },
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
