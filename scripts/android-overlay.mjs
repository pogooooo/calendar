import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * src-tauri/gen 은 .gitignore 대상이라 거기에 직접 쓴 네이티브 코드는 재생성 때 사라진다.
 * 추적되는 src-tauri/android-overlay 를 원본으로 두고, 빌드 직전에 gen 으로 부어 넣는다.
 */

const root = process.cwd();
const overlay = join(root, "src-tauri", "android-overlay");
const gen = join(root, "src-tauri", "gen", "android");

if (!existsSync(gen)) {
    console.error("[android-overlay] gen/android 가 없습니다. 먼저 `tauri android init` 을 실행하세요.");
    process.exit(1);
}

cpSync(join(overlay, "app"), join(gen, "app"), { recursive: true });
console.log("[android-overlay] 네이티브 소스 복사 완료");

const manifestPath = join(gen, "app", "src", "main", "AndroidManifest.xml");
let manifest = readFileSync(manifestPath, "utf8");

const WIDGETS = [
    { cls: "TodayWidgetProvider", info: "widget_today_info" },
    { cls: "NowNextWidgetProvider", info: "widget_nownext_info" },
    { cls: "ChallengeWidgetProvider", info: "widget_challenge_info" },
];

const block = WIDGETS.map(w => `
        <receiver
            android:name=".widget.${w.cls}"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
                <action android:name="com.cronos.todoapp.WIDGET_REFRESH" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/${w.info}" />
        </receiver>`).join("\n");

const MARKER_OPEN = "<!-- cronos-widgets:start -->";
const MARKER_CLOSE = "<!-- cronos-widgets:end -->";
const payload = `${MARKER_OPEN}${block}\n        ${MARKER_CLOSE}`;

if (manifest.includes(MARKER_OPEN)) {
    manifest = manifest.replace(
        new RegExp(`${MARKER_OPEN}[\\s\\S]*?${MARKER_CLOSE}`),
        payload,
    );
} else {
    manifest = manifest.replace("</application>", `        ${payload}\n    </application>`);
}

writeFileSync(manifestPath, manifest, "utf8");
console.log(`[android-overlay] 매니페스트에 위젯 ${WIDGETS.length}종 등록 완료`);
