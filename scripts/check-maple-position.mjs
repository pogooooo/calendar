/**
 * Maple 의 paperCard·도장 단추 같은 조각은 안쪽 괘선(::before)을 놓으려고 `position: relative` 를 건다.
 * 그런데 감싸는 Celestial 요소가 fixed·absolute 로 떠 있는 것이면(떠 있는 쪽지·팝오버·창),
 * 갈래 클래스가 나중에 붙어 그 자리 지정을 덮어쓴다 — 요소가 흐름 속으로 돌아가 화면 밖으로 밀린다.
 * 실제로 날짜/시간 고르개가 이래서 데스크톱에서 화면 밖에 열렸다.
 *
 * 그래서: paperCard 를 쓰는 Maple styles 가 감싸는 Celestial 요소의 position 을 보고,
 * fixed·absolute 면 Maple 쪽에서 그 자리 지정을 다시 적어 두었는지 확인한다.
 *
 *   node scripts/check-maple-position.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

/** 스스로 `position: relative` 를 거는 Maple 조각들 (styles/maple/ink.ts) */
const MIXINS = ["paperCard", "cardFrame", "stampButton", "inkCheckbox", "paperTab"];
const MIXIN_CALL = new RegExp(`\\b(${MIXINS.join("|")})\\(`);

/** src 아래의 .ts/.tsx 전부 */
function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return walk(p);
        return /\.tsx?$/.test(e.name) ? [p] : [];
    });
}

/** `export const NAME = styled.x` 또는 `styled(C.NAME)` 블록의 본문 */
function blocks(code) {
    const out = new Map();
    const re = /export const (\w+)\s*=\s*styled(?:\.\w+|\(([^)]*)\))[^`]*`/g;
    let m;
    while ((m = re.exec(code))) {
        const start = re.lastIndex;
        let depth = 1, i = start;
        while (i < code.length && depth > 0) {
            const ch = code[i];
            if (ch === "\\") { i += 2; continue; }
            if (ch === "`") depth += code[i - 1] === "$" ? 0 : -1;
            if (ch === "$" && code[i + 1] === "{") { // 중첩된 보간은 건너뛴다
                let d2 = 1; i += 2;
                while (i < code.length && d2 > 0) { if (code[i] === "{") d2++; if (code[i] === "}") d2--; i++; }
                continue;
            }
            i++;
        }
        out.set(m[1], { base: (m[2] ?? "").trim(), body: code.slice(start, i - 1) });
    }
    return out;
}

/**
 * 그 요소 자신의 position — 중괄호 안(`&::before { … }`, 미디어 쿼리)의 것은 세지 않는다.
 * 안 그러면 ::before 의 absolute 를 그 요소의 것으로 잘못 읽는다.
 */
function topLevelPosition(body) {
    let depth = 0, found = null;
    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
        else if (depth === 0 && ch === "p" && body.startsWith("position:", i)) {
            const m = /^position:\s*([a-z-]+)/.exec(body.slice(i));
            if (m) found = m[1];
        }
    }
    return found;
}

const files = walk(SRC);
const celestial = new Map(); // "파일경로#이름" → position
for (const f of files) {
    if (!f.includes(`${path.sep}celestial${path.sep}`) && !/Celestial\w+\.styles\.ts$/.test(f)) continue;
    const code = fs.readFileSync(f, "utf8");
    for (const [name, { body }] of blocks(code)) {
        const pos = topLevelPosition(body);
        if (pos) celestial.set(`${path.basename(f)}#${name}`, pos);
    }
}

const problems = [];
for (const f of files) {
    if (!f.includes(`${path.sep}maple${path.sep}`)) continue;
    const code = fs.readFileSync(f, "utf8");
    const from = /import \* as C from "([^"]+)"/.exec(code)?.[1];
    if (!from) continue;
    const baseFile = `${path.basename(from)}.ts`;
    for (const [name, { base, body }] of blocks(code)) {
        // 조각 하나(paperCard)만 보던 탓에 도장 단추를 쓴 달력의 떠 있는 + 가 흐름 속으로 빠져나갔다 — 목록 전부를 본다
        if (!MIXIN_CALL.test(body)) continue;
        if (!base.startsWith("C.")) continue;
        const basePos = celestial.get(`${baseFile}#${base.slice(2)}`);
        if (basePos !== "fixed" && basePos !== "absolute") continue;
        if (/position:\s*(fixed|absolute)/.test(body)) continue;
        problems.push(`${path.relative(process.cwd(), f)} 의 ${name}: 바탕(${base})이 ${basePos} 인데 조각의 relative 가 덮는다 — position: ${basePos} 를 다시 적을 것`);
    }
}

if (problems.length) {
    console.error("떠 있어야 할 것이 흐름 속으로 돌아간다:\n" + problems.map((p) => `  - ${p}`).join("\n"));
    process.exit(1);
}
console.log("Maple 의 카드 조각이 떠 있는 요소의 자리를 덮지 않습니다.");
