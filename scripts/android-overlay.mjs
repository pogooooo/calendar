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
    // 2026-09-17: 화가를 갈래 공용 WidgetPainter 로 바꾸며 이름을 바꿨다
    "java/com/cronos/todoapp/widget/CelestialPainter.kt",
    // 2026-10-15: Maple 을 다시 그리며 위젯의 그림 파일(종이결·먹 테·가지·화살·놋쇠판·잎 표식)과 Cormorant 글꼴을 걷었다
    "res/drawable-nodpi/maple_acorn.webp",
    "res/drawable-nodpi/maple_bullet_filled.webp",
    "res/drawable-nodpi/maple_bullet_outline.webp",
    "res/drawable-nodpi/maple_card_frame.webp",
    "res/drawable-nodpi/maple_check.webp",
    "res/drawable-nodpi/maple_crest.webp",
    "res/drawable-nodpi/maple_gauge_dial.webp",
    "res/drawable-nodpi/maple_ink_arrow_left.webp",
    "res/drawable-nodpi/maple_ink_arrow_right.webp",
    "res/drawable-nodpi/maple_spinner.webp",
    "res/drawable-nodpi/maple_today_marker.webp",
    "res/drawable-nodpi/maple_widget_branch.webp",
    "res/drawable-nodpi/maple_widget_paper_dark.webp",
    "res/drawable-nodpi/maple_widget_paper_light.webp",
    "assets/fonts/CormorantGaramond.ttf",
    "assets/fonts/CormorantGaramond-OFL.txt",
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
                <action android:name="com.cronos.todoapp.WIDGET_SHIFT" />
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
        <!-- 빠른 추가 위젯을 누르면 뜨는 입력 창. 앱을 열지 않고 할 일을 넣는다.
             taskAffinity 를 비워 앱의 작업과 따로 떠야 뒤에 앱이 아니라 홈 화면이 보인다.
             화면을 돌려도 다시 만들지 않는다(configChanges) — 다시 만들면 치던 글이 사라지고, 넣는 중이면 같은 할 일이 둘 생길 수 있었다 -->
        <activity
            android:name=".widget.QuickAddActivity"
            android:exported="false"
            android:theme="@android:style/Theme.Translucent.NoTitleBar"
            android:taskAffinity=""
            android:excludeFromRecents="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboard|keyboardHidden|uiMode"
            android:windowSoftInputMode="stateAlwaysVisible|adjustResize" />
        <!-- 일정 목록·추가·수정·완료·삭제를 런처 위에서 처리하는 전용 창 -->
        <activity
            android:name=".widget.WidgetEditActivity"
            android:exported="false"
            android:theme="@android:style/Theme.Translucent.NoTitleBar"
            android:taskAffinity=""
            android:excludeFromRecents="true"
            android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboard|keyboardHidden|uiMode"
            android:windowSoftInputMode="stateAlwaysHidden|adjustResize" />
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

// 할 일·챌린지를 끝낼 때의 아주 짧은 떨림(웹의 navigator.vibrate — components/fx/FxStage). 웹뷰는 이 권한이 없으면
// 조용히 무시한다. 설치 때 묻지 않는 보통 권한이다.
if (!manifest.includes("android.permission.VIBRATE")) {
    manifest = manifest.replace(
        '<uses-permission android:name="android.permission.INTERNET" />',
        '<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.VIBRATE" />',
    );
}

// 자판이 뜨면 창을 밀어 올리지(pan) 말고 자판 높이를 알려 달라 — MainActivity.fitSystemEdges 가 웹뷰를 줄인다.
// 밀어 올리면 아래에서 올라오는 시트의 머리가 화면 밖으로 나간다.
const mainTag = manifest.match(/<activity\b[^>]*android:name="\.MainActivity"[^>]*>/);
if (!mainTag) {
    console.error("[android-overlay] MainActivity 의 <activity> 를 못 찾았다");
    process.exit(1);
}
if (!mainTag[0].includes("windowSoftInputMode")) {
    manifest = manifest.replace(mainTag[0], mainTag[0].replace(
        'android:name=".MainActivity"',
        'android:name=".MainActivity"\n            android:windowSoftInputMode="adjustResize"',
    ));
}

writeFileSync(manifestPath, manifest, "utf8");
console.log(`[android-overlay] 매니페스트에 위젯 ${WIDGETS.length}종 + 설정 화면 + 딥링크 등록 완료`);

/* ── 서명 설정 ────────────────────────────────────────────────────────────────
   Play 는 서명된 AAB 만 받는다. 열쇠와 비밀번호는 git 밖(src-tauri/keystore.properties)에 두고,
   그 파일이 있을 때만 release 빌드에 서명을 건다 (없으면 예전처럼 서명 없이 구워진다).
   gen 은 재생성되면 사라지므로 이 깁기도 오버레이가 맡는다. */
const gradlePath = join(gen, "app", "build.gradle.kts");
let gradle = readFileSync(gradlePath, "utf8").split(String.fromCharCode(13, 10)).join(String.fromCharCode(10)); // 줄 끝이 섞여 있으면 여러 줄 깁기가 빗나간다

const SIGN_OPEN = "// cronos-signing:start";
const SIGN_CLOSE = "// cronos-signing:end";
const signBlock = `    ${SIGN_OPEN}
    signingConfigs {
        create("release") {
            val ksFile = rootProject.file(providers.gradleProperty("cronosKeystoreProperties").orElse("../../keystore.properties").get())
            if (ksFile.exists()) {
                val ks = Properties().apply { ksFile.inputStream().use { load(it) } }
                storeFile = file(ks.getProperty("storeFile"))
                storePassword = ks.getProperty("storePassword")
                keyAlias = ks.getProperty("keyAlias")
                keyPassword = ks.getProperty("keyPassword")
            }
        }
    }
    ${SIGN_CLOSE}`;

if (gradle.includes(SIGN_OPEN)) {
    // 틀 문자열 안이라 \\ 를 두 번 써야 한다 — 예전의 [\s\S] 는 [sS] 가 되어 이미 깁은 블록을 못 찾고 그대로 두었다
    gradle = gradle.replace(new RegExp(`    ${SIGN_OPEN}[\\s\\S]*?${SIGN_CLOSE}`), signBlock);
} else {
    gradle = gradle.replace("    buildTypes {", `${signBlock}
    buildTypes {`);
}

const USE_SIGN = "signingConfig = signingConfigs.getByName(\"release\")";
if (!gradle.includes(USE_SIGN)) {
    gradle = gradle.replace(
        `        getByName("release") {
            isMinifyEnabled = true`,
        `        getByName("release") {
            if (signingConfigs.getByName("release").storeFile?.exists() == true) {
                ${USE_SIGN}
            }
            isMinifyEnabled = true`,
    );
}

// Update generated projects that already contain the old release signing hook.
gradle = gradle.replace('if (rootProject.file("../../keystore.properties").exists()) {', 'if (signingConfigs.getByName("release").storeFile?.exists() == true) {');

writeFileSync(gradlePath, gradle, "utf8");
console.log("[android-overlay] 선택한 로컬 키를 사용하는 서명 설정 반영 완료");
