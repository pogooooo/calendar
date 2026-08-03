import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["opennextjs-cloudflare", "build"], {
    stdio: "inherit",
    shell: true,
    env: {
        ...process.env,
        BUILD_TARGET: "cloudflare",
        AUTH_SECRET: process.env.AUTH_SECRET ?? "build-time-placeholder",
    },
});

process.exit(result.status ?? 1);
