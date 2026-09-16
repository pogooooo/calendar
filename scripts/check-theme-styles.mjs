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
 * 테마와 무관한 공용 화면(다운로드 안내, 위젯 껍데기 등)은 여기서 보지 않는다.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const SRC = path.join(root, "src");

/** 이 파일들은 테마 갈래가 아니라 예외로 둔다 */
const ALLOW = new Set([]);

const isThemed = (rel) =>
    /(^|[\\/])celestial[\\/]/i.test(rel) || /(^|[\\/])Celestial[^\\/]*\.tsx$/.test(rel);

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

if (offenders.length > 0) {
    console.error("테마 갈래 컴포넌트 안에 styled-components 가 남아 있습니다.");
    console.error("같은 이름의 *.styles.ts 로 옮기고 `import * as S` 로 쓰세요.\n");
    for (const o of offenders) {
        console.error(`  ${o.rel}`);
        console.error(`      ${o.defs.join(", ")}`);
    }
    process.exit(1);
}

console.log("테마 갈래 컴포넌트가 모두 모양을 *.styles.ts 에 두고 있습니다.");
