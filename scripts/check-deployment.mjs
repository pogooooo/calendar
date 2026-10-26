import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const json = file => JSON.parse(readFileSync(join(root, file), "utf8"));
const pkg = json("package.json");
const tauri = json("src-tauri/tauri.conf.json");
const cargo = readFileSync(join(root, "src-tauri/Cargo.toml"), "utf8").match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const cargoLock = readFileSync(join(root, "src-tauri/Cargo.lock"), "utf8").match(/\[\[package\]\]\s+name = "cronos"\s+version = "([^"]+)"/)?.[1];
const lock = json("package-lock.json");
let failures = 0;
function report(ok, message) {
    console.log(`[${ok ? "OK" : "FAIL"}] ${message}`);
    if (!ok) failures++;
}
report([tauri.version, cargo, cargoLock, lock.version, lock.packages[""].version].every(version => version === pkg.version), `버전 일치: package/lock/Tauri/Cargo/Cargo.lock (${pkg.version})`);
report(json("src/lib/release-notes.json").some(note => note.version === pkg.version), "현재 버전 패치 노트 존재");
for (const mode of ["desktop", "android-bundle"]) {
    const result = spawnSync(process.execPath, [join(root, "scripts/native-release.mjs"), mode, "--check"], { cwd: root, stdio: "inherit" });
    report(result.status === 0, `${mode} 로컬 배포 준비`);
}
if (process.argv.includes("--live")) {
    // 읽기 전용: 인증·원격 상태 확인. 릴리스/배포/DB를 변경하지 않는다.
    const gh = spawnSync(process.execPath, [join(root, "scripts/github.mjs"), "api", "repos/pogooooo/calendar", "--jq", ".full_name"], { cwd: root, stdio: "inherit" });
    report(gh.status === 0, "GitHub 저장소 인증");
    const wrangler = spawnSync(process.execPath, [join(root, "node_modules/wrangler/bin/wrangler.js"), "whoami", "--json"], { cwd: root, encoding: "utf8" });
    const cf = wrangler.status === 0 ? JSON.parse(wrangler.stdout) : null;
    report(Boolean(cf?.accounts?.some(account => account.id === "b39c857d1473af13bda46e5b9b74fcb9")), "Cloudflare 인증 및 배포 계정 일치");
    for (const path of ["/", "/download", "/api/update", ...["windows", "android", "macos", "linux"].map(platform => `/api/download?platform=${platform}&check=1`)]) {
        try {
            const response = await fetch(`https://cronos.pogoo.workers.dev${path}`, { signal: AbortSignal.timeout(20000) });
            const data = path.startsWith("/api/") ? await response.json() : null;
            const requiredDownload = /platform=(windows|android)&/.test(path);
            const valid = response.ok && (!requiredDownload || data?.available === true)
                && (path !== "/api/update" || Boolean(data?.version && data?.platforms?.["windows-x86_64"]?.signature));
            report(valid, `웹 ${path}: HTTP ${response.status}`);
            if (data) console.log(JSON.stringify(path === "/api/update" ? { version: data.version, platforms: Object.keys(data.platforms ?? {}) } : data));
            if (path.includes("/api/download") && !requiredDownload && !data?.available) console.warn("[WARN] 이 운영체제의 다운로드 자산을 찾지 못했습니다. 별도로 확인하세요.");
            await response.body?.cancel().catch(() => {});
        } catch (error) { report(false, `${path}: ${error.message}`); }
    }
    console.log("[수동 확인] Google Play 로그인·최대 versionCode·Alpha 트랙 상태는 docs/DEPLOYMENT.md의 Console에서 확인하세요.");
}
process.exitCode = failures ? 1 : 0;
