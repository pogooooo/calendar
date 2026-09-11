/**
 * 위젯 종류가 세 곳에서 같은지 확인한다.
 *
 *   1. src/lib/widgetKinds.ts   — 기준
 *   2. src-tauri/src/lib.rs     — WIDGET_KINDS (여기 없으면 open_widget 이 거부한다)
 *   3. src/app/widget/*         — 실제 화면 폴더 (없으면 빈 404 창이 뜬다)
 *
 * 어긋난 채로 배포되면 사용자에게는 "눌러도 아무 일이 없는 단추"로 보인다.
 * 그래서 빌드에서 먼저 막는다.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

function fromTs() {
    const src = read("src/lib/widgetKinds.ts");
    const block = src.match(/export const WIDGET_KINDS = \[([\s\S]*?)\] as const;/);
    if (!block) throw new Error("widgetKinds.ts 에서 WIDGET_KINDS 를 못 찾았다");
    return [...block[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
}

function fromRust() {
    const src = read("src-tauri/src/lib.rs");
    const block = src.match(/const WIDGET_KINDS: &\[&str\] = &\[([\s\S]*?)\];/);
    if (!block) throw new Error("lib.rs 에서 WIDGET_KINDS 를 못 찾았다");
    return [...block[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
}

function fromRoutes() {
    const dir = path.join(root, "src/app/widget");
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
}

const sort = (a) => [...a].sort();
const diff = (a, b) => a.filter((x) => !b.includes(x));

const ts = fromTs();
const rust = fromRust();
const routes = fromRoutes();

const problems = [];

const missingInRust = diff(ts, rust);
const extraInRust = diff(rust, ts);
const missingRoutes = diff(ts, routes);
const orphanRoutes = diff(routes, ts);

if (missingInRust.length) problems.push(`lib.rs 의 WIDGET_KINDS 에 없다 (열리지 않는다): ${missingInRust.join(", ")}`);
if (extraInRust.length) problems.push(`lib.rs 의 WIDGET_KINDS 에만 있다 (화면 없는 이름): ${extraInRust.join(", ")}`);
if (missingRoutes.length) problems.push(`src/app/widget 에 화면이 없다 (404 창이 뜬다): ${missingRoutes.join(", ")}`);
if (orphanRoutes.length) problems.push(`화면은 있는데 widgetKinds.ts 에 없다: ${orphanRoutes.join(", ")}`);

if (problems.length) {
    console.error("\n위젯 종류가 어긋났습니다.\n");
    for (const p of problems) console.error("  · " + p);
    console.error(`\n  기준(widgetKinds.ts) : ${sort(ts).join(" ")}`);
    console.error(`  lib.rs               : ${sort(rust).join(" ")}`);
    console.error(`  src/app/widget       : ${sort(routes).join(" ")}\n`);
    process.exit(1);
}

console.log(`위젯 종류 ${ts.length}개가 세 곳에서 일치합니다.`);
