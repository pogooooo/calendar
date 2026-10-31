import { spawnSync } from "node:child_process";
import { readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

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

// Next's standalone trace may copy local environment files. The Worker uses
// Cloudflare bindings; keep those local files out of the deployment artifact.
if (result.status === 0) {
    const serverDir = ".open-next/server-functions/default";
    for (const file of readdirSync(serverDir)) {
        if (file === ".env" || file.startsWith(".env.")) rmSync(`${serverDir}/${file}`, { force: true });
    }
    // OpenNext also compiles .env files into a runtime fallback module. Private
    // values must come exclusively from Cloudflare bindings, never local files.
    const envFile = resolve(".open-next/cloudflare/next-env.mjs");
    const values = await import(pathToFileURL(envFile).href);
    const content = ["production", "development", "test"].map(mode => {
        const publicValues = Object.fromEntries(Object.entries(values[mode] ?? {}).filter(([key]) => key.startsWith("NEXT_PUBLIC_")));
        return `export const ${mode} = ${JSON.stringify(publicValues)};\n`;
    }).join("");
    writeFileSync(envFile, content, "utf8");
    console.log("[build-cloudflare] 로컬 비공개 환경값을 제거했습니다. 런타임 Cloudflare 설정을 사용합니다.");
}

process.exit(result.status ?? 1);
