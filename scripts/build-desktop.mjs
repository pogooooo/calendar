import { spawnSync } from "node:child_process";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cronos.pogoo.workers.dev";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.warn(`[build-desktop] NEXT_PUBLIC_API_BASE_URL 미설정 — 기본값 사용: ${apiBase}`);
}

const result = spawnSync("npx", ["next", "build"], {
    stdio: "inherit",
    shell: true,
    env: {
        ...process.env,
        BUILD_TARGET: "desktop",
        NEXT_PUBLIC_API_BASE_URL: apiBase,
    },
});

process.exit(result.status ?? 1);
