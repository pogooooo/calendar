import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

// 오버레이에서 지운 파일은 gen 에 남아 옛 자원을 가리키다 빌드를 깨뜨린다. 여기서 같이 지운다.
const STALE = [
    "res/layout/widget_cronos.xml",
    "res/layout/widget_preview_today.xml",
    "res/layout/widget_preview_nownext.xml",
    "res/layout/widget_preview_challenge.xml",
    "res/drawable/widget_dot.xml",
    "res/drawable/widget_bg.xml",
    "java/com/cronos/todoapp/widget/WidgetSnapshot.kt",
];
for (const rel of STALE) {
    const p = join(gen, "app", "src", "main", rel);
    if (existsSync(p)) { rmSync(p); console.log(`[android-overlay] 옛 파일 제거: ${rel}`); }
}
console.log("[android-overlay] 네이티브 소스 복사 완료");

const manifestPath = join(gen, "app", "src", "main", "AndroidManifest.xml");
let manifest = readFileSync(manifestPath, "utf8");

/** 위젯 종류. kind 는 Kotlin 의 CronosWidgetProvider.kind 와 같다. label 은 위젯 고르기 화면의 이름 */
const WIDGETS = [
    { kind: "today", cls: "TodayWidgetProvider" },
    { kind: "nownext", cls: "NowNextWidgetProvider" },
    { kind: "challenge", cls: "ChallengeWidgetProvider" },
    { kind: "monthgauge", cls: "MonthGaugeWidgetProvider" },
    { kind: "week", cls: "WeekWidgetProvider" },
    { kind: "month", cls: "MonthWidgetProvider" },
    { kind: "anniversary", cls: "AnniversaryWidgetProvider" },
    { kind: "dayprogress", cls: "DayProgressWidgetProvider" },
    { kind: "quickadd", cls: "QuickAddWidgetProvider" },
    { kind: "memo", cls: "MemoWidgetProvider" },
    { kind: "project", cls: "ProjectWidgetProvider" },
];

const receivers = WIDGETS.map(w => `
        <receiver
            android:name=".widget.${w.cls}"
            android:label="@string/widget_${w.kind}_label"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
                <action android:name="com.cronos.todoapp.WIDGET_REFRESH" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/widget_${w.kind}_info" />
        </receiver>`).join("\n");

const extras = `
        <!-- 위젯을 놓을 때 뜨는 설정 화면 (투명도·벌). 런처가 부르므로 exported -->
        <activity
            android:name=".widget.WidgetConfigActivity"
            android:exported="true"
            android:theme="@android:style/Theme.Material.NoActionBar"
            android:excludeFromRecents="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_CONFIGURE" />
            </intent-filter>
        </activity>
        <!-- 개발용: 위젯 미리보기 그림 만들기 (디버그 빌드에서만 일한다) -->
        <receiver
            android:name=".widget.PreviewRenderReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="com.cronos.todoapp.RENDER_PREVIEWS" />
            </intent-filter>
        </receiver>`;

const MARKER_OPEN = "<!-- cronos-widgets:start -->";
const MARKER_CLOSE = "<!-- cronos-widgets:end -->";
const payload = `${MARKER_OPEN}${receivers}\n${extras}\n        ${MARKER_CLOSE}`;

if (manifest.includes(MARKER_OPEN)) {
    manifest = manifest.replace(
        new RegExp(`${MARKER_OPEN}[\\s\\S]*?${MARKER_CLOSE}`),
        payload,
    );
} else {
    manifest = manifest.replace("</application>", `        ${payload}\n    </application>`);
}

// 위젯이 앱을 열 때 쓰는 cronos:// 딥링크 — MainActivity 가 받는다
const LINK_OPEN = "<!-- cronos-link:start -->";
const LINK_CLOSE = "<!-- cronos-link:end -->";
const linkFilter = `${LINK_OPEN}
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:scheme="cronos" />
            </intent-filter>
            ${LINK_CLOSE}`;
if (manifest.includes(LINK_OPEN)) {
    manifest = manifest.replace(new RegExp(`${LINK_OPEN}[\\s\\S]*?${LINK_CLOSE}`), linkFilter);
} else {
    const at = manifest.indexOf('android:name=".MainActivity"');
    const close = manifest.indexOf("</activity>", at);
    if (at < 0 || close < 0) {
        console.error("[android-overlay] MainActivity 를 매니페스트에서 못 찾았다");
        process.exit(1);
    }
    manifest = manifest.slice(0, close) + linkFilter + "\n        " + manifest.slice(close);
}

writeFileSync(manifestPath, manifest, "utf8");
console.log(`[android-overlay] 매니페스트에 위젯 ${WIDGETS.length}종 + 설정 화면 + 딥링크 등록 완료`);
