/**
 * 테마를 타는 화면이 모양을 *.styles.ts 에 두고 있는지 확인한다.
 *
 * 화면은 두 종류다.
 *   - 갈래 공용 View (`XView.tsx`, `parts/`, Select·TimeDial 같은 것): JSX 만 들고,
 *     모양은 `celestial/`·`maple/` 의 *.styles.ts 에서 usePickTheme(STYLES) 로 고른다.
 *   - 갈래 전용 그림 (`celestial/`·`maple/` 폴더의 .tsx, 이름이 Celestial·Maple 로 시작):
 *     로그인 패널·사이드바 가지·달력 분위기처럼 갈래마다 아예 다른 것.
 * 어느 쪽이든 styled-components 를 .tsx 안에 두면 새 갈래가 무엇을 만들어야 하는지
 * 파일을 열어 봐야만 드러난다. 그래서 규칙을 하나로 못 박는다:
 *
 *   테마를 타는 .tsx 는 JSX 만 들고, styled-components 는 *.styles.ts 에 둔다.
 *
 * 그리고 하나 더: 갈래 폴더 **밖**에서 `theme.family === "…"` 로 모양을 가르지 않는다.
 * 그렇게 갈라 두면 갈래가 셋이 될 때 어디를 고쳐야 하는지 파일을 열어 봐야만 알 수 있고,
 * 실제로 위젯·달력 틀·로그인 화면이 그렇게 조금씩 어긋나 있었다. 갈래로 갈리는 모양은
 * celestial/·maple/ 의 *.styles.ts 에 두고 usePickTheme 으로 고른다.
 * (글·아이콘처럼 모양이 아닌 것을 고르는 곳은 GLOSS 에 적어 둔다)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SRC = path.join(root, "src");

/** 이 파일들은 테마 갈래가 아니라 예외로 둔다 */
const ALLOW = new Set([]);

/** 모양이 아니라 글·그림을 고르는 자리 — 여기서만 갈래 이름을 봐도 된다 */
const GLOSS = new Set([
    "src/app/download/page.tsx",        // 한 줄 소개가 갈래마다 다르다 (별자리 / 도감)
    "src/styles/themed.ts",             // 고르개 자체
    "src/styles/theme.ts",              // 갈래 표
]);

const isThemed = (rel) =>
    /(^|[\\/])(celestial|maple|ocean|gem)[\\/]/i.test(rel) || /(^|[\\/])(?:Celestial|Maple|Ocean|Gem)[^\\/]*\.tsx$/.test(rel);

function* walkAll(dir, ext) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const f = path.join(dir, e.name);
        if (e.isDirectory()) yield* walkAll(f, ext);
        else if (e.name.endsWith(ext) && !e.name.endsWith(".d.ts")) yield f;
    }
}

function* walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const f = path.join(dir, e.name);
        if (e.isDirectory()) yield* walk(f);
        else if (e.name.endsWith(".tsx")) yield f;
    }
}

const offenders = [];
for (const file of walk(SRC)) {
    const rel = path.relative(root, file);
    if (!isThemed(rel) || ALLOW.has(rel.split(path.sep).join("/"))) continue;
    const src = fs.readFileSync(file, "utf8");
    const defs = src.match(/^(?:export )?const (\w+) = (?:styled[.(]|keyframes\s*`|css\s*`)/gm);
    if (defs) offenders.push({ rel, defs: defs.map((d) => d.match(/const (\w+)/)[1]) });
}

/* ── 갈래 폴더 밖의 family 분기 ────────────────────────────────────── */
const branched = [];
for (const file of walk(SRC)) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (isThemed(rel) || /(^|\/)maple\//i.test(rel) || /Maple[^/]*\.tsx$/.test(rel)) continue;
    if (GLOSS.has(rel)) continue;
    const src = fs.readFileSync(file, "utf8");
    if (/theme\??\.family\s*===/.test(src)) branched.push(rel);
}
// styles.ts 도 본다 — 갈래 폴더 밖의 *.styles.ts 가 family 로 갈리면 같은 문제다
for (const file of walkAll(SRC, ".ts")) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (/(^|\/)(celestial|maple|ocean|gem)\//i.test(rel) || GLOSS.has(rel)) continue;
    const src = fs.readFileSync(file, "utf8");
    if (/theme\??\.family\s*===/.test(src)) branched.push(rel);
}

if (branched.length > 0) {
    console.error("갈래 폴더 밖에서 theme.family 로 모양을 가르고 있습니다.");
    console.error("그 모양을 celestial/·maple/ 의 *.styles.ts 로 옮기고 usePickTheme 으로 고르세요.\n");
    for (const rel of branched) console.error(`  ${rel}`);
    process.exit(1);
}

if (offenders.length > 0) {
    console.error("테마 갈래 컴포넌트 안에 styled-components 가 남아 있습니다.");
    console.error("같은 이름의 *.styles.ts 로 옮기고 `import * as S` 로 쓰세요.\n");
    for (const o of offenders) {
        console.error(`  ${o.rel}`);
        console.error(`      ${o.defs.join(", ")}`);
    }
    process.exit(1);
}

console.log("테마 갈래 컴포넌트가 모두 모양을 *.styles.ts 에 두고, 갈래 밖에서 모양을 가르지 않습니다.");
