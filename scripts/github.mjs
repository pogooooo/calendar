import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// gh 자체 로그인 또는 Git Credential Manager의 기존 GitHub 자격 증명을 사용한다.
// 토큰을 출력하거나 파일에 복사하지 않는다.
export function githubEnv(base = process.env) {
    const env = { ...base };
    if (env.GH_TOKEN || env.GITHUB_TOKEN) return env;
    const auth = spawnSync("gh", ["auth", "status", "--hostname", "github.com"], {
        env, encoding: "utf8", stdio: "pipe",
    });
    if (auth.status === 0) return env;
    const credential = spawnSync("git", ["credential", "fill"], {
        input: "protocol=https\nhost=github.com\n\n",
        env: { ...env, GCM_INTERACTIVE: "Never", GIT_TERMINAL_PROMPT: "0" },
        encoding: "utf8", stdio: "pipe",
    });
    const token = credential.stdout?.split(/\r?\n/).find(line => line.startsWith("password="))?.slice(9);
    if (credential.status !== 0 || !token) {
        throw new Error("GitHub 인증이 없습니다. gh auth login 또는 기존 Git 자격 증명을 연결하세요.");
    }
    env.GH_TOKEN = token;
    return env;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        if (process.argv.length < 3) throw new Error("사용법: npm run github -- <gh 명령과 인수>");
        const result = spawnSync("gh", process.argv.slice(2), { env: githubEnv(), stdio: "inherit" });
        if (result.error) throw result.error;
        process.exitCode = result.status ?? 1;
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
