import type { NextConfig } from "next";

const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined;

const nextConfig: NextConfig = {
    compiler: {
        styledComponents: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Tauri 프로덕션 빌드 시 standalone 출력 (서버 번들)
    ...(isTauri && { output: "standalone" }),
};

export default nextConfig;
