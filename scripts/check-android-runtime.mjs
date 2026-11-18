import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Check the actual R8 output because a signed package can still lose its JNI entry point. */
export function verifyAndroidRuntime(androidProject, identifier) {
    const mappingFile = join(androidProject, "app", "build", "outputs", "mapping", "arm64Release", "mapping.txt");
    const mapping = readFileSync(mappingFile, "utf8");
    const activity = `${identifier}.TauriActivity`;
    let insideActivity = false;
    for (const line of mapping.split(/\r?\n/)) {
        if (/^[^\s#].* -> .*:$/.test(line)) {
            if (insideActivity) break;
            insideActivity = line === `${activity} -> ${activity}:`;
        }
        if (insideActivity && line.includes("getPluginManager()") && line.trim().endsWith("-> getPluginManager")) {
            console.log("[release] R8 결과에서 Android 시작용 JNI 호출 보존을 확인했습니다.");
            return;
        }
    }
    throw new Error("Android 시작용 TauriActivity.getPluginManager가 R8 결과에서 사라졌습니다. 릴리스를 게시하기 전에 JNI 보존 규칙을 확인하세요.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const config = JSON.parse(readFileSync(join(root, "src-tauri", "tauri.conf.json"), "utf8"));
    verifyAndroidRuntime(join(root, "src-tauri", "gen", "android"), config.identifier);
}
