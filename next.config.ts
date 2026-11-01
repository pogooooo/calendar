import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
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
    ...(isDesktop ? desktopConfig : webConfig),
};

if (!isDesktop) {
    initOpenNextCloudflareForDev();
}

// export 빌드는 distDir가 out-desktop이어도 중간 산출물은 .next에 쓴다.
// 개발 서버의 Turbopack이 그 안에 동시에 쓰면 배포 빌드의 webpack 파일과 섞인다.
export default function config(phase: string): NextConfig {
    const nativeDevHost = process.env.TAURI_DEV_HOST;
    return phase === PHASE_DEVELOPMENT_SERVER
        ? { ...nextConfig, distDir: ".next-dev", allowedDevOrigins: ['127.0.0.1', '10.0.2.2', 'tauri.localhost'],
            // Android's local protocol forwards HTTP, so connect dev assets/HMR to the host directly.
            ...(nativeDevHost ? {
                assetPrefix: `http://${nativeDevHost}:3000`,
                crossOrigin: 'anonymous' as const,
                async headers() {
                    return [
                        ...(await nextConfig.headers?.() ?? []),
                        {source:'/_next/static/:path*',headers:[{key:'Access-Control-Allow-Origin',value:'*'}]},
                    ];
                },
                // Tauri's HTTP proxy cannot carry React's separate debug WebSocket stream.
                experimental: { ...nextConfig.experimental, reactDebugChannel: false },
            } : {}),
        }
        : nextConfig;
}
