/**
 * 로컬 dev 서버(localhost:3000)에 점검용 계정과 자료를 넣는다 — 화면을 눈으로 훑을 때 쓴다.
 *   node scripts/seed-local.mjs          계정(audit@local.test / AuditTest1234!) + 할 일·챌린지·기념일·프로젝트·메모
 *   node scripts/seed-local.mjs delete   그 계정을 지운다 (자료도 같이)
 * 실서버에는 쓰지 말 것 — 주소가 localhost 로 박혀 있다.
 */
const B = "http://localhost:3000";
const EMAIL = "audit@local.test", PW = "AuditTest1234!";
const j = (r) => r.json();
const post = (path, body, token) => fetch(B + path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });

if (process.argv[2] === "delete") {
    const login = await j(await post("/api/auth/login", { email: EMAIL, password: PW }));
    if (!login.accessToken) { console.log("no account"); process.exit(0); }
    const r = await fetch(B + "/api/user", { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${login.accessToken}` }, body: JSON.stringify({ password: PW }) });
    console.log("delete", r.status); process.exit(0);
}

let r = await post("/api/auth/register", { email: EMAIL, password: PW, name: "점검" });
console.log("register", r.status);
const login = await j(await post("/api/auth/login", { email: EMAIL, password: PW }));
const T = login.accessToken; if (!T) { console.log(login); process.exit(1); }
const cats = await j(await fetch(B + "/api/category", { headers: { Authorization: `Bearer ${T}` } }));
const cat = cats[0].id;
const c2 = await j(await post("/api/category", { name: "일", color: "#7FB2E5" }, T));
const c3 = await j(await post("/api/category", { name: "건강", color: "#9FD48A" }, T));
const c4 = await j(await post("/api/category", { name: "사람", color: "#E58A7F" }, T));
const id = (x) => x?.id ?? cat;
const at = (dayOff, h, m) => { const d = new Date(); d.setDate(d.getDate() + dayOff); d.setHours(h, m, 0, 0); return d.toISOString(); };
const todos = [
    ["아침 달리기", id(c3), at(0, 7, 0), at(0, 8, 0), false], ["팀 회의 — 분기 계획", id(c2), at(0, 10, 0), at(0, 11, 0), false],
    ["민이와 점심", id(c4), at(0, 12, 30), at(0, 13, 30), false], ["책 30쪽", cat, at(0, 0, 0), at(0, 23, 59), true], ["영양제", id(c3), at(0, 0, 0), at(0, 23, 59), true],
    ["치과", id(c3), at(1, 14, 0), at(1, 15, 0), false], ["요가", id(c3), at(2, 19, 0), at(2, 20, 0), false], ["발표 준비", id(c2), at(3, 9, 0), at(3, 12, 0), false],
    ["친구 생일", id(c4), at(5, 0, 0), at(5, 23, 59), true], ["장보기", cat, at(-3, 17, 0), at(-3, 18, 0), false], ["은행", cat, at(8, 11, 0), at(8, 11, 30), false],
    ["워크숍 (사흘)", id(c2), at(9, 0, 0), at(11, 23, 59), true],
];
for (let i = 0; i < 6; i++) todos.push([`많은 날 ${i + 1}`, [cat, id(c2), id(c3), id(c4)][i % 4], at(2, 8 + i, 0), at(2, 9 + i, 0), false]);
const made = [];
for (const [title, categoryId, startAt, endAt, isAllDay] of todos) made.push(await j(await post("/api/todo", { title, categoryId, startAt, endAt, isAllDay }, T)));
const todayKey = new Date().toISOString().slice(0, 10);
for (const t of [made[0], made[4]]) if (t?.id) await fetch(B + "/api/todo", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${T}` }, body: JSON.stringify({ id: t.id, targetDate: todayKey }) });
console.log("todos", made.filter(t => t.id).length);
for (const [title, targetCount, startOff, days, includeToday] of [["일찍 일어나기", 30, -11, 12, true], ["스트레칭 10분", 21, -3, 4, false], ["물 2L 마시기", null, -39, 40, false]]) {
    const c = await j(await post("/api/challenge", { title, startAt: at(startOff, 0, 0), interval: 1, targetCount, categoryId: cat }, T));
    if (!c.id) continue;
    for (let k = 0; k < days; k++) { const d = new Date(); d.setDate(d.getDate() + (includeToday ? -k : -(k + 1))); await post("/api/challenge/completion", { challengeId: c.id, targetDate: d.toISOString().slice(0, 10) }, T); }
}
const nxt = (off) => { const d = new Date(); d.setDate(d.getDate() + off); return { month: d.getMonth() + 1, day: d.getDate() }; };
for (const [title, icon, off] of [["결혼기념일", "ring", 12], ["어머니 생신", "cake", 30], ["입사", "star", -41]]) await post("/api/anniversary", { title, icon, ...nxt(off) }, T);
for (const [title, endOff, done, total] of [["CRONOS 1.1 배포", 5, 13, 18], ["가을 테마 (Maple)", 21, 3, 20]]) {
    const p = await j(await post("/api/project", { title, categoryId: cat, startAt: at(-10, 0, 0), endAt: at(endOff, 0, 0) }, T));
    if (!p.id) continue;
    for (let k = 0; k < total; k++) await post("/api/project/task", { title: `${title} 작업 ${k + 1}`, projectId: p.id, status: k < done ? "done" : (k < done + 2 ? "in_progress" : "todo"), priority: "medium", ...(k < 3 ? { startAt: at(k, 9, 0), endAt: at(k, 10, 0) } : {}) }, T);
}
await post("/api/dailyMemo", { content: "회의 전에 지난 분기 숫자 다시 보기.", date: todayKey }, T);
console.log("seeded", EMAIL);
