/**
 * GitHub 릴리스의 자산으로 자동 업데이트용 latest.json 을 한 번에 만든다.
 *
 *   node scripts/build-updater-json.mjs v1.0.0 > latest.json
 *
 * 왜 따로 만드나 — release.yml 은 Win·Mac·Linux 를 나란히 돌리고, tauri-action 은
 * 저마다 "기존 latest.json 을 받아 제 항목을 합쳐 다시 올린다". 세 작업이 거의 같은
 * 순간에 끝나면 남이 올린 항목을 못 보고 덮어써서, v1.0.0 에서는 windows-x86_64 가
 * 빠진 채 올라갔다 (윈도우 앱이 업데이트를 못 찾은 까닭). 그래서 세 빌드가 다 끝난
 * 뒤 이 스크립트가 자산 목록을 보고 완전한 파일을 한 번만 쓴다.
 *
 * 서명(.sig)은 tauri-action 이 이미 자산으로 올려 두었으므로 그 내용을 그대로 담는다.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const tag = process.argv[2];
if (!tag) { console.error("usage: build-updater-json.mjs <tag>"); process.exit(1); }
const repo = process.env.GITHUB_REPOSITORY ?? "pogooooo/calendar";
const version = tag.replace(/^v/, "");

const gh = (args) => execFileSync("gh", args, { encoding: "utf8" });

// 패치 노트: src/lib/release-notes.json 의 해당 판. 앱의 설정 > 정보 탭과 같은 글이다.
const NOTES = JSON.parse(readFileSync(new URL("../src/lib/release-notes.json", import.meta.url), "utf8"));
const note = NOTES.find((n) => n.version === version);
const notesText = note
    ? note.notes.ko.map((l) => `• ${l}`).join("\n")
    : "";
// --release-body 를 주면 latest.json 대신 GitHub 릴리스 본문(마크다운)을 찍는다
if (process.argv.includes("--release-body")) {
    const body = note
        ? [`## v${note.version} · ${note.date}`, "", ...note.notes.ko.map((l) => `- ${l}`), "", "---", "", ...note.notes.en.map((l) => `- ${l}`)].join("\n")
        : "아래에서 운영체제에 맞는 설치 파일을 내려받으세요. 이미 설치한 앱은 실행 시 자동으로 업데이트를 확인합니다.";
    process.stdout.write(body + "\n");
    process.exit(0);
}
const release = JSON.parse(gh(["api", `repos/${repo}/releases/tags/${tag}`]));
const assets = release.assets.map(a => a.name);
const url = (name) => `https://github.com/${repo}/releases/download/${tag}/${name}`;

/** 자산 이름 규칙 → 업데이터 플랫폼 키 */
const RULES = [
    { keys: ["windows-x86_64"], pick: /_x64-setup\.exe$/ },
    { keys: ["darwin-aarch64", "darwin-x86_64", "darwin-aarch64-app", "darwin-x86_64-app"], pick: /\.app\.tar\.gz$/ },
    { keys: ["linux-x86_64", "linux-x86_64-appimage"], pick: /\.AppImage$/ },
    { keys: ["linux-x86_64-deb"], pick: /\.deb$/ },
    { keys: ["linux-x86_64-rpm"], pick: /\.rpm$/ },
];

const platforms = {};
const missing = [];
for (const rule of RULES) {
    const file = assets.find(n => rule.pick.test(n));
    const sigName = file && assets.find(n => n === `${file}.sig`);
    if (!file || !sigName) { missing.push(rule.keys[0]); continue; }
    // .sig 는 몇백 바이트짜리 텍스트다
    // 계정이 플래그되면 browser_download_url 은 익명에게 404 다 — 인증된 gh 로 자산을 받는다
    const sigId = release.assets.find(a => a.name === sigName).id;
    const signature = gh(["api", `repos/${repo}/releases/assets/${sigId}`, "-H", "Accept: application/octet-stream"]).trim();
    for (const key of rule.keys) platforms[key] = { signature, url: url(file) };
}

if (!platforms["windows-x86_64"]) {
    // 윈도우가 빠진 파일은 올리지 않는다 — 그게 이 스크립트가 있는 이유다
    console.error(`windows-x86_64 자산이 없다. 빠진 것: ${missing.join(", ")}`);
    process.exit(1);
}
if (missing.length) console.error(`참고: 빠진 플랫폼 ${missing.join(", ")}`);

process.stdout.write(JSON.stringify({
    version,
    notes: notesText || (release.body ?? ""),
    pub_date: new Date().toISOString(),
    platforms,
}, null, 2) + "\n");
