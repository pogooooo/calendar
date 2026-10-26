import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const url = "http://localhost:3000";

function listening() {
    return new Promise((accept) => {
        const socket = createConnection({ host: "localhost", port: 3000 });
        const done = (open) => { socket.destroy(); accept(open); };
        socket.once("connect", () => done(true));
        socket.once("error", () => done(false));
        socket.setTimeout(2000, () => done(false));
    });
}

try {
    if (await listening()) {
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        const html = await response.text();
        if (!response.ok || !/name="application-name"\s+content="CRONOS"/i.test(html)) {
            throw new Error("3000 포트를 다른 서비스가 사용 중입니다. 해당 서비스를 종료한 뒤 tauri:dev를 다시 실행하세요.");
        }
        console.log(`[tauri dev] 이미 실행 중인 CRONOS 개발 서버를 사용합니다: ${url}`);
    } else {
        // 포트가 바쁘면 명확하게 실패한다. Tauri가 다른 서버를 여는 사이 Next만 3001로 옮기지 않게 한다.
        const child = spawn(process.execPath, [join(root, "node_modules", "next", "dist", "bin", "next"), "dev", "--turbopack", "--port", "3000"], {
            cwd: root, env: process.env, stdio: "inherit",
        });
        for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
        child.on("error", error => { console.error(`[tauri dev] ${error.message}`); process.exitCode = 1; });
        child.on("exit", code => { process.exitCode = code ?? 1; });
    }
} catch (error) {
    console.error(`[tauri dev] ${error.message}`);
    process.exitCode = 1;
}
