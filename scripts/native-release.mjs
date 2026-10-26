import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2];
const check = process.argv.includes("--check");

function properties(file) {
    if (!existsSync(file)) throw new Error(`필수 로컬 설정이 없습니다: ${file}`);
    return Object.fromEntries(readFileSync(file, "utf8").split(/\r?\n/)
        .filter(line => /^\s*[^#!\s][^=]*=/.test(line))
        .map(line => { const at = line.indexOf("="); return [line.slice(0, at).trim(), line.slice(at + 1).trim()]; }));
}

function run(args, env) {
    const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`빌드 명령 실패 (exit ${result.status ?? 1})`);
}

async function androidBuild(cli, gen, env) {
    const args = [cli, "android", "build", mode === "android-bundle" ? "--aab" : "--apk", "--target", "aarch64"];
    let tail = "";
    const status = await new Promise((accept, reject) => {
        const child = spawn(process.execPath, args, { cwd: root, env, stdio: ["inherit", "pipe", "pipe"] });
        for (const [stream, output] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
            stream.on("data", data => { output.write(data); tail = (tail + data.toString()).slice(-32000); });
        }
        child.on("error", reject);
        child.on("close", accept);
    });
    if (status === 0) return;
    // Tauri는 Rust 컴파일을 마친 다음 jniLibs에 심볼릭 링크를 만든다.
    // 일반 Windows 권한에서는 이 마지막 단계만 실패할 수 있다.
    if (process.platform !== "win32" || !tail.includes("Creation symbolic link is not allowed for this system.")) {
        throw new Error(`Android 빌드 명령 실패 (exit ${status ?? 1})`);
    }
    packageAndroid(gen, env);
}

function packageAndroid(gen, env) {
    const targetDir = env.CARGO_TARGET_DIR ? resolve(root, "src-tauri", env.CARGO_TARGET_DIR) : join(root, "src-tauri", "target");
    const library = join(targetDir, "aarch64-linux-android", "release", "libcronos_lib.so");
    if (!existsSync(library)) throw new Error("방금 컴파일한 Android 라이브러리가 없습니다.");
    const generated = properties(join(gen, "app", "tauri.properties"));
    const conf = JSON.parse(readFileSync(join(root, "src-tauri", "tauri.conf.json"), "utf8"));
    if (generated["tauri.android.versionName"] !== conf.version) throw new Error("Android 생성 버전이 설정과 다릅니다.");
    if (existsSync(join(root, "src-tauri", "tauri.android.conf.json")) || Object.keys(conf.bundle?.resources ?? {}).length) {
        throw new Error("추가 Android 설정/리소스가 있습니다. Windows 복사 패키징에 해당 설정을 반영한 뒤 다시 빌드하세요.");
    }
    const dest = join(gen, "app", "src", "main", "jniLibs", "arm64-v8a", "libcronos_lib.so");
    mkdirSync(dirname(dest), { recursive: true });
    if (existsSync(dest) && lstatSync(dest).isSymbolicLink()) unlinkSync(dest);
    copyFileSync(library, dest);
    const assets = join(gen, "app", "src", "main", "assets");
    mkdirSync(assets, { recursive: true });
    writeFileSync(join(assets, "tauri.conf.json"), JSON.stringify(conf), "utf8");
    console.log("[release] 컴파일 완료된 ARM64 라이브러리를 복사해 Gradle로 패키징합니다.");
    const task = mode === "android-bundle" ? ":app:bundleArm64Release" : ":app:assembleArm64Release";
    const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "gradlew.bat", task, "-x", ":app:rustBuildArm64Release"], { cwd: gen, env, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Android Gradle 패키징 실패 (exit ${result.status ?? 1})`);
}

try {
    if (!["desktop", "android-bundle", "android-apk"].includes(mode)) {
        throw new Error("사용법: native-release.mjs desktop|android-bundle|android-apk [--check]");
    }
    const env = { ...process.env };
    const cli = join(root, "node_modules", "@tauri-apps", "cli", "tauri.js");
    if (!existsSync(cli)) throw new Error("먼저 npm ci를 실행하세요.");
    if (mode === "desktop") {
        const props = properties(join(root, "src-tauri", "updater.properties"));
        if (!props.privateKey) throw new Error("updater.properties의 privateKey가 비어 있습니다.");
        // 기존 파일은 개인키 파일 경로를 담는다. Tauri는 인라인 개인키도 지원한다.
        if (!props.privateKey.startsWith("dW50") && !existsSync(resolve(root, props.privateKey))) {
            throw new Error("데스크톱 서명 개인키 파일을 찾을 수 없습니다.");
        }
        env.TAURI_SIGNING_PRIVATE_KEY = props.privateKey;
        env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD = props.password ?? "";
        console.log("[release] 데스크톱 업데이트 서명 설정 확인 완료");
        if (!check) run([cli, "build"], env);
    } else {
        const props = properties(join(root, "src-tauri", "keystore.properties"));
        if (!["storeFile", "storePassword", "keyAlias", "keyPassword"].every(key => props[key])) {
            throw new Error("keystore.properties의 서명 설정을 모두 채우세요.");
        }
        const gen = join(root, "src-tauri", "gen", "android");
        const keystore = resolve(gen, "app", props.storeFile);
        if (!existsSync(keystore)) throw new Error("Android 업로드 키 파일을 찾을 수 없습니다.");
        if (!existsSync(gen)) throw new Error("먼저 npm run tauri -- android init을 실행하세요.");
        const tools = join(homedir(), "tools");
        const jdk = existsSync(tools) ? readdirSync(tools).filter(name => /^jdk-17[.-]/.test(name)).sort().at(-1) : undefined;
        env.JAVA_HOME ||= jdk ? join(tools, jdk) : "";
        env.ANDROID_HOME ||= env.ANDROID_SDK_ROOT || join(tools, "android-sdk");
        env.ANDROID_SDK_ROOT ||= env.ANDROID_HOME;
        const ndk = join(env.ANDROID_HOME, "ndk");
        const ndks = existsSync(ndk) ? readdirSync(ndk).filter(name => /^\d+\./.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
        env.NDK_HOME ||= ndks.length ? join(ndk, ndks.at(-1)) : "";
        for (const [name, path] of [["JAVA_HOME", join(env.JAVA_HOME, "bin", process.platform === "win32" ? "java.exe" : "java")], ["ANDROID_HOME", join(env.ANDROID_HOME, "platform-tools")], ["NDK_HOME", env.NDK_HOME]]) {
            if (!path || !existsSync(path)) throw new Error(`${name} 경로를 확인하세요.`);
        }
        // Windows의 기존 키는 보통 Path다. 복사한 객체에서는 대소문자가 구분된다.
        const pathKey = Object.keys(env).find(key => key.toLowerCase() === "path") ?? "PATH";
        env[pathKey] = `${join(env.JAVA_HOME, "bin")}${delimiter}${env[pathKey] ?? ""}`;
        console.log("[release] Android 업로드 서명 키·JDK·SDK·NDK 확인 완료");
        if (!check) {
            run([join(root, "scripts", "android-overlay.mjs")], env);
            await androidBuild(cli, gen, env);
        }
    }
    if (check) console.log("[release] 점검만 완료했습니다. 빌드·업로드하지 않았습니다.");
} catch (error) {
    console.error(`[release] ${error.message}`);
    process.exitCode = 1;
}
