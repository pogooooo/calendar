import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

rmSync(".next", { recursive: true, force: true });

// AUTH_SECRET 을 여기서 채워 넣으면 그 값이 빌드 산출물에 그대로 박혀
// 런타임 시크릿이 없을 때 공개된 문자열이 JWT 서명 키로 쓰인다.
// 시크릿은 Cloudflare 쪽에만 두고, 빌드 프로세스에는 넘기지 않는다.
// 메일 API 키도 같은 이유로 막는다 — 로컬 .env 값이 배포본에 박히면 키가 공개된다.
const result = spawnSync("npx", ["opennextjs-cloudflare", "build"], {
    stdio: "inherit",
    shell: true,
    env: {
        ...process.env,
        BUILD_TARGET: "cloudflare",
        AUTH_SECRET: undefined,
        BREVO_API_KEY: undefined,
        RESEND_API_KEY: undefined,
        SMTP_PASS: undefined,
    },
});

process.exit(result.status ?? 1);
